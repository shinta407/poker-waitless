'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Store, Table, WaitlistEntry, StoreWithStatus } from '@/lib/types'
import { getStoreStatus } from '@/lib/storeStatus'
import { mockStores, mockTables, mockWaitlist } from '@/lib/mock/data'

export function useRealtimeStores() {
  const [stores, setStores] = useState<StoreWithStatus[]>([])
  const [loading, setLoading] = useState(true)
  const useMockMode = process.env.NEXT_PUBLIC_USE_MOCK_MODE === 'true'

  useEffect(() => {
    if (useMockMode) {
      // モックモード: モックデータを使用
      const storesWithStatus: StoreWithStatus[] = mockStores.map(store => {
        const storeTables = mockTables.filter(t => t.store_id === store.id)
        const storeWaitlist = mockWaitlist.filter(w => w.store_id === store.id)
        const status = getStoreStatus(storeTables, storeWaitlist)

        return {
          ...store,
          status,
          tables: storeTables,
          waitlist: storeWaitlist,
        }
      })
      setStores(storesWithStatus)
      setLoading(false)
      return
    }

    // 本番モード: Supabaseからデータ取得
    let isMounted = true

    async function loadStores() {
      try {
        const { data: storesData, error: storesError } = await supabase
          .from('stores')
          .select(`
            *,
            tables (*),
            waitlist (*)
          `)

        if (storesError) throw storesError

        if (isMounted && storesData) {
          const storesWithStatus: StoreWithStatus[] = storesData.map((store: any) => ({
            ...store,
            status: getStoreStatus(store.tables || [], store.waitlist || []),
            tables: store.tables || [],
            waitlist: store.waitlist || [],
          }))
          setStores(storesWithStatus)
          setLoading(false)
        }
      } catch (error) {
        console.error('Error loading stores:', error)
        setLoading(false)
      }
    }

    loadStores()

    // リアルタイム購読: テーブル変更
    const tablesChannel = supabase
      .channel('all-tables')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tables',
      }, () => {
        console.log('🔄 Tables updated, reloading stores...')
        loadStores()
      })
      .subscribe()

    // リアルタイム購読: ウェイティングリスト変更
    const waitlistChannel = supabase
      .channel('all-waitlist')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'waitlist',
      }, () => {
        console.log('🔄 Waitlist updated, reloading stores...')
        loadStores()
      })
      .subscribe()

    return () => {
      isMounted = false
      tablesChannel.unsubscribe()
      waitlistChannel.unsubscribe()
    }
  }, [useMockMode])

  return { stores, loading }
}
