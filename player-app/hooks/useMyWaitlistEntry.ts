'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { WaitlistEntry, Store } from '@/lib/types'
import { mockStores, mockWaitlist } from '@/lib/mock/data'

export function useMyWaitlistEntry(waitlistId: string) {
  const [entry, setEntry] = useState<WaitlistEntry | null>(null)
  const [store, setStore] = useState<Store | null>(null)
  const [position, setPosition] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const useMockMode = process.env.NEXT_PUBLIC_USE_MOCK_MODE === 'true'

  useEffect(() => {
    if (useMockMode) {
      // モックモード
      const foundEntry = mockWaitlist.find(w => w.id === waitlistId)
      if (foundEntry) {
        setEntry(foundEntry)

        const foundStore = mockStores.find(s => s.id === foundEntry.store_id)
        setStore(foundStore || null)

        // 順位計算
        const sameRateWaitlist = mockWaitlist.filter(
          w =>
            w.store_id === foundEntry.store_id &&
            w.rate_preference === foundEntry.rate_preference &&
            w.status === 'waiting' &&
            new Date(w.created_at) <= new Date(foundEntry.created_at)
        )
        setPosition(sameRateWaitlist.length)
      }
      setLoading(false)
      return
    }

    // 本番モード: Supabaseからデータ取得
    let isMounted = true

    async function loadEntry() {
      try {
        const { data: entryData, error: entryError } = await supabase
          .from('waitlist')
          .select(`
            *,
            stores (*)
          `)
          .eq('id', waitlistId)
          .single()

        if (entryError) throw entryError

        if (isMounted && entryData) {
          setEntry(entryData)
          setStore((entryData as any).stores)

          // 順位計算
          const { data: beforeMe } = await supabase
            .from('waitlist')
            .select('id')
            .eq('store_id', entryData.store_id)
            .eq('rate_preference', entryData.rate_preference)
            .eq('status', 'waiting')
            .lt('created_at', entryData.created_at)

          setPosition((beforeMe?.length || 0) + 1)
          setLoading(false)
        }
      } catch (error) {
        console.error('Error loading waitlist entry:', error)
        setLoading(false)
      }
    }

    loadEntry()

    // リアルタイム購読: 自分のエントリ
    const channel = supabase
      .channel(`my-entry-${waitlistId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'waitlist',
        filter: `id=eq.${waitlistId}`,
      }, (payload) => {
        console.log('🔄 My entry updated:', payload)
        if (isMounted) {
          setEntry(payload.new as WaitlistEntry)

          // 呼び出されたら通知
          if ((payload.new as WaitlistEntry).status === 'called') {
            console.log('🔔 You have been called!')
            // モーダル表示などの処理をここに追加
          }
        }
      })
      .subscribe()

    return () => {
      isMounted = false
      channel.unsubscribe()
    }
  }, [waitlistId, useMockMode])

  return { entry, store, position, loading }
}
