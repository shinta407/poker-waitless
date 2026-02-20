'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import type { WaitlistEntry } from '@/lib/types'
import { useRealtimeStore } from '@/hooks/useRealtimeStore'
import { supabase } from '@/lib/supabase'
import { getPlayerId, getPlayerName, savePlayerName } from '@/lib/playerProfile'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Loader } from '@/components/ui/Loader'
import { IconButton } from '@/components/ui/IconButton'

function getDefaultArrivalTime(): string {
  const now = new Date()
  const future = new Date(now.getTime() + 30 * 60000)
  // Round up to next 5-minute mark
  const minutes = future.getMinutes()
  const remainder = minutes % 5
  if (remainder !== 0) {
    future.setMinutes(minutes + (5 - remainder))
  }
  future.setSeconds(0, 0)
  const hh = String(future.getHours()).padStart(2, '0')
  const mm = String(future.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

function getArrivalMinutesFromNow(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number)
  const now = new Date()
  const target = new Date()
  target.setHours(hours, minutes, 0, 0)
  // If target is before now, assume next day
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1)
  }
  return Math.max(1, Math.round((target.getTime() - now.getTime()) / 60000))
}

export default function StoreDetailPage() {
  const params = useParams()
  const router = useRouter()
  const t = useTranslations('store')
  const tCommon = useTranslations('common')
  const locale = useLocale()
  const storeId = params.storeId as string

  const [selectedRate, setSelectedRate] = useState<string>('')
  const [arrivalTime, setArrivalTime] = useState<string>(getDefaultArrivalTime())

  const { store, waitlist, loading } = useRealtimeStore(storeId, selectedRate)

  // Redirect to QR page if no player name is registered
  useEffect(() => {
    const name = getPlayerName()
    if (!name) {
      router.replace(`/${locale}/qr`)
    }
  }, [router, locale])

  useEffect(() => {
    if (store && !selectedRate) {
      setSelectedRate(store.rates[0])
    }
  }, [store, selectedRate])

  const handleCheckIn = async () => {
    const playerName = getPlayerName()
    if (!playerName) {
      router.replace(`/${locale}/qr`)
      return
    }

    const userId = getPlayerId()
    const arrivalMinutes = getArrivalMinutesFromNow(arrivalTime)
    const useMockMode = process.env.NEXT_PUBLIC_USE_MOCK_MODE === 'true'

    if (useMockMode) {
      const newEntry: WaitlistEntry = {
        id: `wait-${Date.now()}`,
        store_id: storeId,
        user_id: userId,
        user_name: playerName,
        rate_preference: selectedRate,
        status: 'waiting',
        called_at: null,
        arrival_estimation_minutes: arrivalMinutes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      console.log('✅ チェックイン成功（モック）:', newEntry)
      const mockStatusPath = locale === 'zh-TW' ? `/status/${newEntry.id}` : `/${locale}/status/${newEntry.id}`
      router.push(mockStatusPath)
    } else {
      try {
        await supabase.from('users').upsert({ id: userId, name: playerName })

        const { data, error } = await supabase
          .from('waitlist')
          .insert({
            store_id: storeId,
            user_id: userId,
            user_name: playerName,
            rate_preference: selectedRate,
            arrival_estimation_minutes: arrivalMinutes,
            status: 'waiting',
          })
          .select()
          .single()

        if (error) throw error

        console.log('✅ チェックイン成功:', data)
        const statusPath = locale === 'zh-TW' ? `/status/${data.id}` : `/${locale}/status/${data.id}`
        router.push(statusPath)
      } catch (error) {
        console.error('❌ チェックインエラー:', error)
        alert(t('checkInFailed'))
      }
    }
  }

  if (loading || !store) {
    return <Loader fullScreen text={tCommon('loading')} />
  }

  const waitingCount = waitlist.length
  const minWait = waitingCount * 15
  const maxWait = waitingCount * 30

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b p-4">
        <div className="flex items-center gap-3 mb-3">
          <IconButton
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            }
            onClick={() => router.back()}
            aria-label={tCommon('back')}
            variant="default"
            size="md"
          />
          <h1 className="text-2xl font-bold text-gray-800">{store.name}</h1>
        </div>
        <div className="text-gray-600">
          {t('storeInfo', { city: '台北市', hours: '12:00-24:00' })}
        </div>
      </div>

      <div className="p-4 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-gray-700 mb-3">
            {t('selectRate')}
          </h2>
          <div className="flex gap-3">
            {store.rates.map(rate => (
              <Button
                key={rate}
                onClick={() => setSelectedRate(rate)}
                variant={selectedRate === rate ? 'primary' : 'secondary'}
                size="lg"
                fullWidth
                aria-label={`${t('selectRate')}: ${rate}`}
              >
                {rate}
              </Button>
            ))}
          </div>
        </div>

        <Card padding="lg">
          <h2 className="text-lg font-bold text-gray-700 mb-3">
            {t('waitlistStatus')} ({selectedRate})
          </h2>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-blue-600">
              {t('peopleWaiting', { count: waitingCount })}
            </div>
            <div className="text-gray-600">
              {t('estimatedWait', { time: `${minWait}-${maxWait}` })}
            </div>
          </div>
        </Card>

        {waitlist.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-700 mb-3">
              {t('waitingPlayers')}
            </h2>
            <div className="space-y-2">
              {waitlist.map((entry, index) => (
                <div key={entry.id} className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                  <span className="text-lg font-bold text-blue-600 w-8">#{index + 1}</span>
                  <span className="font-medium text-gray-800">{entry.user_name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-lg font-bold text-gray-700 mb-3">
            {t('arrivalTime')}
          </h2>
          <input
            type="time"
            value={arrivalTime}
            onChange={(e) => setArrivalTime(e.target.value)}
            className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none bg-white"
            aria-label={t('arrivalTimePlaceholder')}
          />
        </div>

        <Button
          onClick={handleCheckIn}
          disabled={!selectedRate}
          variant="primary"
          size="xl"
          fullWidth
          className="!bg-green-500 hover:!bg-green-600"
        >
          {t('checkIn')}
        </Button>
      </div>
    </div>
  )
}
