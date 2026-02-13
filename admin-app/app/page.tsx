'use client'

import { useState, useEffect } from 'react'
import { Theater, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { type WaitlistEntry, type Table, supabase } from '@/lib/supabase'
import { mockWaitlist, mockTables } from '@/lib/mockData'
import WaitlistPanel from '@/components/WaitlistPanel'
import TableStatusPanel from '@/components/TableStatusPanel'
import RateTabs from '@/components/RateTabs'
import { AddPlayerModal } from '@/components/features/AddPlayerModal'
import { QRScanModal } from '@/components/features/QRScanModal'
import { ConfirmDialog } from '@/components/features/ConfirmDialog'
import { useToast } from '@/hooks/useToast'

const RATES = ['1/3', '2/5', '5/10+', 'Tournament']

// 🎭 MOCK MODE - Using mock data instead of Supabase
const USE_MOCK_DATA = false

export default function AdminPage() {
  const [selectedRate, setSelectedRate] = useState('1/3')
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

  // Toast notifications
  const toast = useToast()

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

  // Load data when store is ready or rate changes
  useEffect(() => {
    if (USE_MOCK_DATA) {
      setWaitlist(mockWaitlist[selectedRate] || [])
      setTables(mockTables[selectedRate] || [])
      return
    }

    if (!storeId) return

    let isMounted = true

    const initializeData = async () => {
      await loadSupabaseData(storeId, selectedRate, isMounted)
    }

    initializeData()

    return () => {
      isMounted = false
    }
  }, [selectedRate, storeId])

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
        .in('status', ['waiting', 'called']) // Exclude seated and cancelled

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
                // Only show waiting or called players
                if (newEntry.status === 'waiting' || newEntry.status === 'called') {
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
      toast.success('プレイヤーを呼び出しました')
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
        toast.success('プレイヤーを呼び出しました')
      } catch (err) {
        console.error('❌ Error calling player:', err)
        toast.error('呼び出しに失敗しました')
      }
    }
  }

  const handleSeatPlayer = async (playerId: string) => {
    if (USE_MOCK_DATA) {
      setWaitlist(prev => prev.filter(player => player.id !== playerId))
      setTables(prev => {
        const availableTable = prev.find(t => t.current_players < t.max_seats)
        if (availableTable) {
          return prev.map(table =>
            table.id === availableTable.id
              ? { ...table, current_players: table.current_players + 1 }
              : table
          )
        }
        return prev
      })
      console.log('✅ Player seated (MOCK MODE):', playerId)
      toast.success('プレイヤーを着席させました')
    } else {
      try {
        console.log('🔄 Seating player:', playerId)

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

        // Find and increment matching table
        const player = waitlist.find(p => p.id === playerId)
        const matchingTable = tables.find(t => t.rate === player?.rate_preference && t.current_players < t.max_seats)

        if (matchingTable) {
          console.log('🔄 Incrementing table seats:', matchingTable.id)
          const { data: tableData, error: tableError } = await supabase
            .from('tables')
            .update({ current_players: matchingTable.current_players + 1 })
            .eq('id', matchingTable.id)
            .select()

          if (tableError) {
            console.error('❌ Error updating table:', tableError)
            throw tableError
          }
          console.log('✅ Updated table:', tableData)
        }

        console.log('✅ Player seated:', playerId)
        toast.success('プレイヤーを着席させました')
      } catch (err) {
        console.error('❌ Error seating player:', err)
        toast.error('着席処理に失敗しました')
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
      toast.success('座席数を更新しました')
    } else {
      try {
        const table = tables.find(t => t.id === tableId)
        if (!table) {
          console.error('❌ Table not found:', tableId)
          return
        }

        const newCount = Math.max(0, Math.min(table.max_seats, table.current_players + increment))
        console.log('🔄 Updating table:', { tableId, newCount, currentPlayers: table.current_players })

        const { data, error } = await supabase
          .from('tables')
          .update({ current_players: newCount })
          .eq('id', tableId)
          .select()

        if (error) {
          console.error('❌ Supabase UPDATE error:', error)
          throw error
        }

        console.log('✅ Seats updated:', { tableId, newCount, response: data })
        toast.success('座席数を更新しました')
      } catch (err) {
        console.error('❌ Error updating seats:', err)
        toast.error('座席数の更新に失敗しました')
      }
    }
  }

  const handleAddPlayer = async (name: string, rate: string) => {
    try {
      if (USE_MOCK_DATA) {
        // Mock implementation
        const now = new Date().toISOString()
        const newPlayer: WaitlistEntry = {
          id: `mock-${Date.now()}`,
          store_id: storeId || 'mock-store',
          user_id: `manual-${Date.now()}`,
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
            user_id: `manual-${Date.now()}`,
            user_name: name,
            rate_preference: rate,
            status: 'waiting',
          })

        if (error) throw error

        toast.success(`${name}を追加しました`)
        // Real-time subscription will update UI automatically
      }
    } catch (error) {
      console.error('Error adding player:', error)
      toast.error('プレイヤー追加に失敗しました')
      throw error
    }
  }

  const handleQRScan = async (userId: string) => {
    try {
      if (USE_MOCK_DATA) {
        // Mock: Find user by ID and add to waitlist
        toast.success(`QRスキャン成功（デモモード）`)
      } else {
        if (!storeId) throw new Error('Store ID not set')

        // Fetch user info from Supabase
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single()

        if (userError) throw userError

        // Add to waitlist
        const { error: insertError } = await supabase
          .from('waitlist')
          .insert({
            store_id: storeId,
            user_id: userId,
            user_name: userData.name,
            rate_preference: selectedRate, // Use current selected rate
            status: 'waiting',
          })

        if (insertError) throw insertError

        toast.success(`${userData.name}を追加しました`)
      }
    } catch (error) {
      console.error('Error scanning QR:', error)
      toast.error('QRスキャンに失敗しました')
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
        toast.success('プレイヤーを削除しました')
      } else {
        // Update status to 'cancelled' instead of hard delete
        const { error } = await supabase
          .from('waitlist')
          .update({ status: 'cancelled' })
          .eq('id', playerToDelete)

        if (error) throw error

        toast.success('プレイヤーを削除しました')
        // Real-time subscription will remove from UI
      }
    } catch (error) {
      console.error('Error deleting player:', error)
      toast.error('削除に失敗しました')
    } finally {
      setPlayerToDelete(null)
    }
  }

  return (
    <div className="h-screen w-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Mock Mode / Loading / Error Banner */}
      {USE_MOCK_DATA && (
        <div className="bg-blue-100 text-blue-900 border-b-2 border-blue-300 px-6 py-3 flex items-center justify-center gap-3">
          <Theater className="w-5 h-5" aria-hidden="true" />
          <span className="font-bold text-lg">デモモード - モックデータ使用中（Supabase未接続）</span>
        </div>
      )}
      {!USE_MOCK_DATA && loading && (
        <div className="bg-blue-100 text-blue-900 border-b-2 border-blue-300 px-6 py-3 flex items-center justify-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
          <span className="font-bold text-lg">Supabaseから データを読み込み中...</span>
        </div>
      )}
      {!USE_MOCK_DATA && error && (
        <div className="bg-red-100 text-red-900 border-b-2 border-red-300 px-6 py-3 flex items-center justify-center gap-3" role="alert">
          <AlertCircle className="w-5 h-5" aria-hidden="true" />
          <span className="font-bold text-lg">エラー: {error}</span>
        </div>
      )}
      {!USE_MOCK_DATA && !loading && !error && (
        <div className="bg-green-100 text-green-900 border-b-2 border-green-300 px-6 py-3 flex items-center justify-center gap-3">
          <CheckCircle className="w-5 h-5" aria-hidden="true" />
          <span className="font-bold text-lg">Supabaseに接続しました</span>
        </div>
      )}

      {/* Top Bar */}
      <RateTabs
        rates={RATES}
        selectedRate={selectedRate}
        onRateChange={setSelectedRate}
        storeName={storeName}
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
            onCallPlayer={handleCallPlayer}
            onSeatPlayer={handleSeatPlayer}
            onDeletePlayer={handleDeletePlayer}
            onAddPlayer={() => setAddPlayerModalOpen(true)}
            onQRScan={() => setQRScanModalOpen(true)}
            selectedRate={selectedRate}
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
        defaultRate={selectedRate}
        rates={RATES}
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
    </div>
  )
}
