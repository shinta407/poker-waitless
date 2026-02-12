'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Store, Table, WaitlistEntry } from '@/lib/types'
import { mockStores, mockTables, mockWaitlist } from '@/lib/mock/data'

export function useRealtimeStore(storeId: string, rate: string) {
  const [store, setStore] = useState<Store | null>(null)
  const [tables, setTables] = useState<Table[]>([])
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([])
  const [loading, setLoading] = useState(true)
  const useMockMode = process.env.NEXT_PUBLIC_USE_MOCK_MODE === 'true'

  useEffect(() => {
    if (useMockMode) {
      // モックモード
      const foundStore = mockStores.find(s => s.id === storeId)
      if (foundStore) {
        setStore(foundStore)
        setTables(mockTables.filter(t => t.store_id === storeId))
        setWaitlist(mockWaitlist.filter(w => w.store_id === storeId))
      }
      setLoading(false)
      return
    }

    // 本番モード: Supabaseからデータ取得
    let isMounted = true

    async function loadData() {
      try {
        // 店舗情報取得
        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('*')
          .eq('id', storeId)
          .single()

        if (storeError) throw storeError
        if (isMounted) setStore(storeData)

        // テーブル情報取得
        const { data: tablesData, error: tablesError } = await supabase
          .from('tables')
          .select('*')
          .eq('store_id', storeId)
          .eq('rate', rate)

        if (tablesError) throw tablesError
        if (isMounted) setTables(tablesData || [])

        // ウェイティングリスト取得
        const { data: waitlistData, error: waitlistError } = await supabase
          .from('waitlist')
          .select('*')
          .eq('store_id', storeId)
          .eq('rate_preference', rate)
          .eq('status', 'waiting')

        if (waitlistError) throw waitlistError
        if (isMounted) {
          setWaitlist(waitlistData || [])
          setLoading(false)
        }
      } catch (error) {
        console.error('Error loading store data:', error)
        setLoading(false)
      }
    }

    loadData()

    // リアルタイム購読
    const tablesChannel = supabase
      .channel(`tables-${storeId}-${rate}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tables',
        filter: `store_id=eq.${storeId}`,
      }, (payload) => {
        console.log('🔄 Table change:', payload)
        if (payload.new && (payload.new as any).rate === rate) {
          loadData()
        }
      })
      .subscribe()

    const waitlistChannel = supabase
      .channel(`waitlist-${storeId}-${rate}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'waitlist',
        filter: `store_id=eq.${storeId}`,
      }, (payload) => {
        console.log('🔄 Waitlist change:', payload)
        if (payload.new && (payload.new as any).rate_preference === rate) {
          loadData()
        }
      })
      .subscribe()

    return () => {
      isMounted = false
      tablesChannel.unsubscribe()
      waitlistChannel.unsubscribe()
    }
  }, [storeId, rate, useMockMode])

  return { store, tables, waitlist, loading }
}
