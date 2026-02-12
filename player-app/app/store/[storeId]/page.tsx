'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import type { WaitlistEntry } from '@/lib/types'
import { useRealtimeStore } from '@/hooks/useRealtimeStore'
import { getMockUser, supabase } from '@/lib/supabase'

export default function StoreDetailPage() {
  const params = useParams()
  const router = useRouter()
  const t = useTranslations('store')
  const storeId = params.storeId as string

  const [selectedRate, setSelectedRate] = useState<string>('')
  const [arrivalTime, setArrivalTime] = useState<number>(15)

  // リアルタイムフック使用
  const { store, waitlist, loading } = useRealtimeStore(storeId, selectedRate)

  useEffect(() => {
    if (store && !selectedRate) {
      setSelectedRate(store.rates[0]) // デフォルトで最初のレート
    }
  }, [store, selectedRate])

  const handleCheckIn = async () => {
    const user = getMockUser()
    const useMockMode = process.env.NEXT_PUBLIC_USE_MOCK_MODE === 'true'

    if (useMockMode) {
      // モックモード
      const newEntry: WaitlistEntry = {
        id: `wait-${Date.now()}`,
        store_id: storeId,
        user_id: user.userId,
        user_name: user.displayName,
        rate_preference: selectedRate,
        status: 'waiting',
        called_at: null,
        arrival_estimation_minutes: arrivalTime,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      console.log('✅ チェックイン成功（モック）:', newEntry)
      router.push(`/status/${newEntry.id}`)
    } else {
      // 本番モード: Supabaseに保存
      try {
        const { data, error } = await supabase
          .from('waitlist')
          .insert({
            store_id: storeId,
            user_id: user.userId,
            user_name: user.displayName,
            rate_preference: selectedRate,
            arrival_estimation_minutes: arrivalTime,
            status: 'waiting',
          })
          .select()
          .single()

        if (error) throw error

        console.log('✅ チェックイン成功:', data)
        router.push(`/status/${data.id}`)
      } catch (error) {
        console.error('❌ チェックインエラー:', error)
        alert('チェックインに失敗しました')
      }
    }
  }

  if (loading || !store) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">読み込み中...</div>
      </div>
    )
  }

  const waitingCount = waitlist.length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b p-4">
        <button
          onClick={() => router.back()}
          className="text-blue-500 mb-2"
        >
          ← 戻る
        </button>
        <h1 className="text-2xl font-bold text-gray-800">{store.name}</h1>
        <div className="text-gray-600 mt-1">
          📍 台北市 | 🕐 12:00-24:00
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* レート選択 */}
        <div>
          <h2 className="text-lg font-bold text-gray-700 mb-3">
            {t('selectRate')}
          </h2>
          <div className="flex gap-3">
            {store.rates.map(rate => (
              <button
                key={rate}
                onClick={() => setSelectedRate(rate)}
                className={`flex-1 py-4 rounded-lg font-bold text-lg ${
                  selectedRate === rate
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {rate}
              </button>
            ))}
          </div>
        </div>

        {/* 待ち状況 */}
        <div className="bg-white rounded-lg p-4">
          <h2 className="text-lg font-bold text-gray-700 mb-3">
            {t('waitlistStatus')} ({selectedRate})
          </h2>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-blue-600">
              {waitingCount}人待ち
            </div>
            <div className="text-gray-600">
              予測待ち時間: {waitingCount * 15}-{waitingCount * 30}分
            </div>
          </div>
        </div>

        {/* 到着時間選択 */}
        <div>
          <h2 className="text-lg font-bold text-gray-700 mb-3">
            {t('arrivalTime')}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[15, 30, 45, 60].map(minutes => (
              <button
                key={minutes}
                onClick={() => setArrivalTime(minutes)}
                className={`py-4 rounded-lg font-bold ${
                  arrivalTime === minutes
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {minutes}分後
              </button>
            ))}
          </div>
        </div>

        {/* チェックインボタン */}
        <button
          onClick={handleCheckIn}
          disabled={!selectedRate}
          className="w-full bg-green-500 hover:bg-green-600 text-white
                     py-6 rounded-xl font-bold text-2xl
                     disabled:bg-gray-300 disabled:cursor-not-allowed
                     transition-all active:scale-95"
        >
          {t('checkIn')}
        </button>
      </div>
    </div>
  )
}
