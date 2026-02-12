'use client'

import { useState, useEffect } from 'react'
import { type WaitlistEntry, type Table, supabase } from '@/lib/supabase'
import { mockWaitlist, mockTables } from '@/lib/mockData'
import WaitlistPanel from '@/components/WaitlistPanel'
import TableStatusPanel from '@/components/TableStatusPanel'
import RateTabs from '@/components/RateTabs'

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
                return [...prev, payload.new as WaitlistEntry]
              } else {
                return prev.map(w => w.id === payload.new?.id ? payload.new as WaitlistEntry : w)
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
      } catch (err) {
        console.error('❌ Error calling player:', err)
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
      } catch (err) {
        console.error('❌ Error seating player:', err)
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
      } catch (err) {
        console.error('❌ Error updating seats:', err)
      }
    }
  }

  return (
    <div className="h-screen w-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Mock Mode / Loading / Error Banner */}
      {USE_MOCK_DATA && (
        <div className="bg-yellow-400 text-black px-4 py-2 text-center font-bold text-lg">
          🎭 デモモード - モックデータ使用中（Supabase未接続）
        </div>
      )}
      {!USE_MOCK_DATA && loading && (
        <div className="bg-blue-400 text-white px-4 py-2 text-center font-bold text-lg">
          ⏳ Supabaseから データを読み込み中...
        </div>
      )}
      {!USE_MOCK_DATA && error && (
        <div className="bg-red-500 text-white px-4 py-2 text-center font-bold text-lg">
          ❌ エラー: {error}
        </div>
      )}
      {!USE_MOCK_DATA && !loading && !error && (
        <div className="bg-green-500 text-white px-4 py-2 text-center font-bold text-lg">
          ✅ Supabaseに接続しました
        </div>
      )}

      {/* Top Bar */}
      <RateTabs
        rates={RATES}
        selectedRate={selectedRate}
        onRateChange={setSelectedRate}
        storeName={storeName}
      />

      {/* Main Content: 60/40 Split */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Waitlist (60%) */}
        <div className="w-[60%] border-r-4 border-gray-300 overflow-auto">
          <WaitlistPanel
            waitlist={waitlist}
            onCallPlayer={handleCallPlayer}
            onSeatPlayer={handleSeatPlayer}
            selectedRate={selectedRate}
          />
        </div>

        {/* Right Panel: Table Status (40%) */}
        <div className="w-[40%] overflow-auto bg-white">
          <TableStatusPanel
            tables={tables}
            onUpdateSeats={handleUpdateSeats}
          />
        </div>
      </div>
    </div>
  )
}
