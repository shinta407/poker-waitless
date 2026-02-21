'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Theater, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { type WaitlistEntry, type Table, supabase } from '@/lib/supabase'
import { mockWaitlist, mockTables } from '@/lib/mockData'
import WaitlistPanel from '@/components/WaitlistPanel'
import TableStatusPanel from '@/components/TableStatusPanel'
import RateTabs from '@/components/RateTabs'
import { AddPlayerModal } from '@/components/features/AddPlayerModal'
import { QRScanModal } from '@/components/features/QRScanModal'
import { ConfirmDialog } from '@/components/features/ConfirmDialog'
import { SettingsModal } from '@/components/features/SettingsModal'
import { useToast } from '@/hooks/useToast'

// 🎭 MOCK MODE - Using mock data instead of Supabase
const USE_MOCK_DATA = false

export default function AdminPage() {
  const router = useRouter()
  const [buyIns, setBuyIns] = useState<string[]>([]) // NT$ format buy-in amounts
  const [selectedBuyIn, setSelectedBuyIn] = useState<string>('')
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([])
  const [tables, setTables] = useState<Table[]>([])
  const [storeName] = useState('CTP Taipei') // Default store
  const [storeId, setStoreId] = useState<string | null>(null) // Store ID
  const [loading, setLoading] = useState(!USE_MOCK_DATA)
  const [error, setError] = useState<string | null>(null)

  // Modal states
  const [addPlayerModalOpen, setAddPlayerModalOpen] = useState(false)
  const [qrScanModalOpen, setQRScanModalOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [playerToDelete, setPlayerToDelete] = useState<string | null>(null)
  const [settingsModalOpen, setSettingsModalOpen] = useState(false)

  // Toast notifications
  const toast = useToast()
  const t = useTranslations()
  const tMockMode = useTranslations('mockMode')
  const tToast = useTranslations('toast')

  // Load initial store data
  useEffect(() => {
    if (USE_MOCK_DATA) return

    const initializeStore = async () => {
      try {
        const { data: storeData } = await supabase
          .from('stores')
          .select('*')
          .eq('name', storeName)
          .single()

        if (storeData) {
          setStoreId(storeData.id)
          // Load buy-in amounts from database (NT$ format)
          const loadedBuyIns = storeData.rates || []
          setBuyIns(loadedBuyIns)
          // Set first buy-in as default selected
          if (loadedBuyIns.length > 0) {
            setSelectedBuyIn(loadedBuyIns[0])
          }
        } else {
          setError('Store not found')
        }
      } catch (err) {
        console.error('Error initializing store:', err)
        setError(err instanceof Error ? err.message : 'Failed to initialize store')
      }
    }

    initializeStore()
  }, [])

  // Load data when store is ready or buy-in changes
  useEffect(() => {
    if (USE_MOCK_DATA) {
      setWaitlist(mockWaitlist[selectedBuyIn] || [])
      setTables(mockTables[selectedBuyIn] || [])
      return
    }

    if (!storeId || !selectedBuyIn) return

    let isMounted = true

    const initializeData = async () => {
      await loadSupabaseData(storeId, selectedBuyIn, isMounted)
    }

    initializeData()

    return () => {
      isMounted = false
    }
  }, [selectedBuyIn, storeId])

  const loadSupabaseData = async (store: string, rate: string, isMounted: boolean) => {
    if (!store) {
      console.log('Store ID not set yet')
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Fetch waitlist for this store and rate
      const { data: waitlistData, error: waitlistError } = await supabase
        .from('waitlist')
        .select('*')
        .eq('store_id', store)
        .eq('rate_preference', rate)
        .in('status', ['waiting', 'called', 'arrived']) // Exclude seated and cancelled

      if (waitlistError) {
        console.error('Waitlist error:', waitlistError)
        throw waitlistError
      }
      console.log('Fetched waitlist:', waitlistData)
      if (isMounted) setWaitlist(waitlistData || [])

      // Fetch tables for this store and rate
      const { data: tablesData, error: tablesError } = await supabase
        .from('tables')
        .select('*')
        .eq('store_id', store)
        .eq('rate', rate)

      if (tablesError) {
        console.error('Tables error:', tablesError)
        throw tablesError
      }
      console.log('Fetched tables:', tablesData)
      if (isMounted) setTables(tablesData || [])
      if (isMounted) setLoading(false)

      // Subscribe to realtime changes
      const waitlistSubscription = supabase
        .channel(`waitlist-${store}-${rate}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'waitlist',
          filter: `store_id=eq.${store}`,
        }, (payload) => {
          console.log('Waitlist change:', payload)
          if (isMounted && ((payload.new as WaitlistEntry)?.rate_preference === rate || (payload.old as WaitlistEntry)?.rate_preference === rate)) {
            setWaitlist(prev => {
              if (payload.eventType === 'DELETE') {
                return prev.filter(w => w.id !== payload.old?.id)
              } else if (payload.eventType === 'INSERT') {
                const newEntry = payload.new as WaitlistEntry
                // Only show waiting, called, or arrived players
                if (newEntry.status === 'waiting' || newEntry.status === 'called' || newEntry.status === 'arrived') {
                  return [...prev, newEntry]
                }
                return prev
              } else {
                const updated = payload.new as WaitlistEntry
                // Remove if status changed to seated or cancelled
                if (updated.status === 'seated' || updated.status === 'cancelled') {
                  return prev.filter(w => w.id !== updated.id)
                }
                return prev.map(w => w.id === updated.id ? updated : w)
              }
            })
          }
        })
        .subscribe()

      const tablesSubscription = supabase
        .channel(`tables-${store}-${rate}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'tables',
          filter: `store_id=eq.${store}`,
        }, (payload) => {
          console.log('Tables change:', payload)
          if (isMounted && ((payload.new as Table)?.rate === rate || (payload.old as Table)?.rate === rate)) {
            setTables(prev => {
              if (payload.eventType === 'DELETE') {
                return prev.filter(t => t.id !== payload.old?.id)
              } else if (payload.eventType === 'INSERT') {
                return [...prev, payload.new as Table]
              } else {
                return prev.map(t => t.id === payload.new?.id ? payload.new as Table : t)
              }
            })
          }
        })
        .subscribe()

      return () => {
        console.log('Unsubscribing from channels')
        waitlistSubscription.unsubscribe()
        tablesSubscription.unsubscribe()
      }
    } catch (err) {
      console.error('Error loading data:', err)
      if (isMounted) setError(err instanceof Error ? err.message : 'Failed to load data')
      if (isMounted) setLoading(false)
    }
  }

  const handleCallPlayer = async (playerId: string) => {
    if (USE_MOCK_DATA) {
      setWaitlist(prev => prev.map(player =>
        player.id === playerId
          ? { ...player, status: 'called' as const, called_at: new Date().toISOString() }
          : player
      ))
      console.log('✅ Player called (MOCK MODE):', playerId)
      toast.success(t('toast.playerCalled'))
    } else {
      try {
        const now = new Date().toISOString()
        console.log('🔄 Calling player:', { playerId, called_at: now })

        const { data, error } = await supabase
          .from('waitlist')
          .update({
            status: 'called',
            called_at: now,
          })
          .eq('id', playerId)
          .select()

        if (error) {
          console.error('❌ Supabase UPDATE error:', error)
          throw error
        }

        console.log('✅ Player called:', { playerId, response: data })
        toast.success(t('toast.playerCalled'))
      } catch (err) {
        console.error('❌ Error calling player:', err)
        toast.error(t('toast.callFailed'))
      }
    }
  }

  const handleSeatPlayer = async (playerId: string, tableId: string) => {
    if (USE_MOCK_DATA) {
      setWaitlist(prev => prev.filter(player => player.id !== playerId))
      setTables(prev =>
        prev.map(table =>
          table.id === tableId
            ? { ...table, current_players: table.current_players + 1 }
            : table
        )
      )
      console.log('✅ Player seated (MOCK MODE):', playerId, 'to table:', tableId)
      toast.success(t('toast.playerSeated', { name: '' }))
    } else {
      try {
        console.log('🔄 Seating player:', playerId, 'to table:', tableId)

        // Update player status to seated
        const { data: playerData, error: updateError } = await supabase
          .from('waitlist')
          .update({ status: 'seated' })
          .eq('id', playerId)
          .select()

        if (updateError) {
          console.error('❌ Error updating waitlist:', updateError)
          throw updateError
        }

        console.log('✅ Updated waitlist:', playerData)

        // Atomic increment of table seats
        console.log('🔄 Incrementing table seats:', tableId)
        const { data: tableData, error: tableError } = await supabase
          .rpc('increment_table_seats', { table_id: tableId, delta: 1 })

        if (tableError) {
          console.error('❌ Error updating table:', tableError)
          throw tableError
        }
        console.log('✅ Updated table:', tableData)

        console.log('✅ Player seated:', playerId)
        const player = waitlist.find(p => p.id === playerId)
        toast.success(tToast('playerSeated', { name: player?.user_name || '' }))
      } catch (err) {
        console.error('❌ Error seating player:', err)
        toast.error(t('toast.seatFailed'))
      }
    }
  }

  const handleUpdateSeats = async (tableId: string, increment: number) => {
    if (USE_MOCK_DATA) {
      setTables(prev => prev.map(table => {
        if (table.id === tableId) {
          const newCount = Math.max(0, Math.min(table.max_seats, table.current_players + increment))
          return { ...table, current_players: newCount }
        }
        return table
      }))
      console.log('✅ Seats updated (MOCK MODE):', tableId, increment)
      toast.success(t('toast.seatsUpdated'))
    } else {
      try {
        console.log('🔄 Updating table seats:', { tableId, increment })

        const { data, error } = await supabase
          .rpc('increment_table_seats', { table_id: tableId, delta: increment })

        if (error) {
          console.error('❌ Supabase RPC error:', error)
          throw error
        }

        console.log('✅ Seats updated:', data)
        toast.success(t('toast.seatsUpdated'))
      } catch (err) {
        console.error('❌ Error updating seats:', err)
        toast.error(t('toast.updateFailed'))
      }
    }
  }

  const handleAddPlayer = async (name: string, rate: string) => {
    try {
      if (USE_MOCK_DATA) {
        // Mock implementation
        const now = new Date().toISOString()
        const newPlayer: WaitlistEntry = {
          id: crypto.randomUUID(),
          store_id: storeId || 'mock-store',
          user_id: crypto.randomUUID(),
          user_name: name,
          rate_preference: rate,
          status: 'waiting',
          created_at: now,
          updated_at: now,
          arrival_estimation_minutes: null,
          called_at: null,
        }
        setWaitlist(prev => [...prev, newPlayer])
        toast.success(`${name}を追加しました`)
      } else {
        if (!storeId) throw new Error('Store ID not set')

        // Supabase insert
        const { error } = await supabase
          .from('waitlist')
          .insert({
            store_id: storeId,
            user_id: crypto.randomUUID(),
            user_name: name,
            rate_preference: rate,
            status: 'waiting',
          })

        if (error) throw error

        toast.success(tToast('playerAdded', { name }))
        // Real-time subscription will update UI automatically
      }
    } catch (error) {
      console.error('Error adding player:', error)
      toast.error(t('toast.addFailed'))
      throw error
    }
  }

  const handleQRScan = async (userId: string, name: string) => {
    try {
      if (USE_MOCK_DATA) {
        toast.success(tToast('playerArrived', { name }))
      } else {
        if (!storeId) throw new Error('Store ID not set')

        const { data, error: updateError } = await supabase
          .from('waitlist')
          .update({ status: 'arrived' })
          .eq('user_id', userId)
          .eq('store_id', storeId)
          .in('status', ['waiting', 'called'])
          .select()

        if (updateError) throw updateError

        if (!data || data.length === 0) {
          toast.error(tToast('playerNotFound'))
          return
        }

        toast.success(tToast('playerArrived', { name }))
      }
    } catch (error) {
      console.error('Error scanning QR:', error)
      toast.error(t('toast.qrScanFailed'))
    }
  }

  const handleDeletePlayer = (playerId: string) => {
    setPlayerToDelete(playerId)
    setDeleteConfirmOpen(true)
  }

  const confirmDeletePlayer = async () => {
    if (!playerToDelete) return

    try {
      if (USE_MOCK_DATA) {
        setWaitlist(prev => prev.filter(p => p.id !== playerToDelete))
        toast.success(t('toast.playerDeleted'))
      } else {
        // Update status to 'cancelled' instead of hard delete
        const { error } = await supabase
          .from('waitlist')
          .update({ status: 'cancelled' })
          .eq('id', playerToDelete)

        if (error) throw error

        toast.success(t('toast.playerDeleted'))
        // Real-time subscription will remove from UI
      }
    } catch (error) {
      console.error('Error deleting player:', error)
      toast.error(t('toast.deleteFailed'))
    } finally {
      setPlayerToDelete(null)
    }
  }

  const handleBuyInsUpdate = (newBuyIns: string[]) => {
    setBuyIns(newBuyIns)
    // If current selection is no longer valid, select first buy-in
    if (!newBuyIns.includes(selectedBuyIn) && newBuyIns.length > 0) {
      setSelectedBuyIn(newBuyIns[0])
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="h-screen w-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Mock Mode / Loading / Error Banner */}
      {USE_MOCK_DATA && (
        <div className="bg-blue-100 text-blue-900 border-b-2 border-blue-300 px-6 py-3 flex items-center justify-center gap-3">
          <Theater className="w-5 h-5" aria-hidden="true" />
          <span className="font-bold text-lg">{tMockMode('banner')}</span>
        </div>
      )}
      {!USE_MOCK_DATA && loading && (
        <div className="bg-blue-100 text-blue-900 border-b-2 border-blue-300 px-6 py-3 flex items-center justify-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
          <span className="font-bold text-lg">{tMockMode('loading')}</span>
        </div>
      )}
      {!USE_MOCK_DATA && error && (
        <div className="bg-red-100 text-red-900 border-b-2 border-red-300 px-6 py-3 flex items-center justify-center gap-3" role="alert">
          <AlertCircle className="w-5 h-5" aria-hidden="true" />
          <span className="font-bold text-lg">{tMockMode('error', { error })}</span>
        </div>
      )}
      {!USE_MOCK_DATA && !loading && !error && (
        <div className="bg-green-100 text-green-900 border-b-2 border-green-300 px-6 py-3 flex items-center justify-center gap-3">
          <CheckCircle className="w-5 h-5" aria-hidden="true" />
          <span className="font-bold text-lg">{tMockMode('connected')}</span>
        </div>
      )}

      {/* Top Bar */}
      <RateTabs
        rates={buyIns}
        selectedRate={selectedBuyIn}
        onRateChange={setSelectedBuyIn}
        storeName={storeName}
        onOpenSettings={() => setSettingsModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content: 60/40 Split - Responsive */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Panel: Waitlist (60% on large screens, full width on small) */}
        <div className="
          flex-1 lg:w-[60%]
          border-b-4 lg:border-b-0 lg:border-r-4
          border-gray-300
          overflow-auto
        ">
          <WaitlistPanel
            waitlist={waitlist}
            tables={tables}
            onCallPlayer={handleCallPlayer}
            onSeatPlayer={handleSeatPlayer}
            onDeletePlayer={handleDeletePlayer}
            onAddPlayer={() => setAddPlayerModalOpen(true)}
            onQRScan={() => setQRScanModalOpen(true)}
            selectedRate={selectedBuyIn}
          />
        </div>

        {/* Right Panel: Table Status (40% on large screens, full width on small) */}
        <div className="
          flex-1 lg:w-[40%]
          overflow-auto
          bg-white
        ">
          <TableStatusPanel
            tables={tables}
            onUpdateSeats={handleUpdateSeats}
          />
        </div>
      </div>

      {/* Modals */}
      <AddPlayerModal
        isOpen={addPlayerModalOpen}
        onClose={() => setAddPlayerModalOpen(false)}
        onSubmit={handleAddPlayer}
        defaultRate={selectedBuyIn}
        rates={buyIns}
      />

      <QRScanModal
        isOpen={qrScanModalOpen}
        onClose={() => setQRScanModalOpen(false)}
        onScanSuccess={handleQRScan}
      />

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false)
          setPlayerToDelete(null)
        }}
        onConfirm={confirmDeletePlayer}
        title="プレイヤーを削除"
        message="このプレイヤーを待機リストから削除しますか?"
        confirmLabel="削除"
        cancelLabel="キャンセル"
        variant="danger"
      />

      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        storeId={storeId || ''}
        buyIns={buyIns}
        onBuyInsUpdate={handleBuyInsUpdate}
      />
    </div>
  )
}
