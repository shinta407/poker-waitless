'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import type { WaitlistEntry } from '@/lib/types'
import { useRealtimeStore } from '@/hooks/useRealtimeStore'
import { getMockUser, supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Loader } from '@/components/ui/Loader'
import { IconButton } from '@/components/ui/IconButton'
import { Input } from '@/components/ui/Input'

export default function StoreDetailPage() {
  const params = useParams()
  const router = useRouter()
  const t = useTranslations('store')
  const tCommon = useTranslations('common')
  const storeId = params.storeId as string

  const [selectedRate, setSelectedRate] = useState<string>('')
  const [arrivalTime, setArrivalTime] = useState<number>(15)
  const [playerName, setPlayerName] = useState<string>('')
  const [playerNameError, setPlayerNameError] = useState<string>('')

  const { store, waitlist, loading } = useRealtimeStore(storeId, selectedRate)

  useEffect(() => {
    if (store && !selectedRate) {
      setSelectedRate(store.rates[0])
    }
  }, [store, selectedRate])

  const MAX_PLAYER_NAME_LENGTH = 20

  const validatePlayerName = (name: string): string => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      return t('playerNameRequired')
    }
    if (trimmedName.length > MAX_PLAYER_NAME_LENGTH) {
      return t('playerNameTooLong', { max: MAX_PLAYER_NAME_LENGTH })
    }
    return ''
  }

  const handlePlayerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPlayerName(value)
    if (playerNameError) {
      setPlayerNameError('')
    }
  }

  const handleCheckIn = async () => {
    // Validate player name
    const error = validatePlayerName(playerName)
    if (error) {
      setPlayerNameError(error)
      return
    }

    const trimmedPlayerName = playerName.trim()
    const useMockMode = process.env.NEXT_PUBLIC_USE_MOCK_MODE === 'true'

    if (useMockMode) {
      const newEntry: WaitlistEntry = {
        id: `wait-${Date.now()}`,
        store_id: storeId,
        user_id: `user_${Date.now()}`,
        user_name: trimmedPlayerName,
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
      try {
        const { data, error } = await supabase
          .from('waitlist')
          .insert({
            store_id: storeId,
            user_id: `user_${Date.now()}`,
            user_name: trimmedPlayerName,
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

  const arrivalOptions = [
    { minutes: 15, key: '15min' as const },
    { minutes: 30, key: '30min' as const },
    { minutes: 45, key: '45min' as const },
    { minutes: 60, key: '60min' as const }
  ]

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

        <div>
          <Input
            label={t('playerName')}
            placeholder={t('playerNamePlaceholder')}
            value={playerName}
            onChange={handlePlayerNameChange}
            error={playerNameError}
            maxLength={MAX_PLAYER_NAME_LENGTH}
            aria-required="true"
          />
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-700 mb-3">
            {t('arrivalTime')}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {arrivalOptions.map(({ minutes, key }) => (
              <Button
                key={minutes}
                onClick={() => setArrivalTime(minutes)}
                variant={arrivalTime === minutes ? 'primary' : 'secondary'}
                size="lg"
                aria-label={`${t('arrivalTime')}: ${t(`arrivalOptions.${key}`)}`}
              >
                {t(`arrivalOptions.${key}`)}
              </Button>
            ))}
          </div>
        </div>

        <Button
          onClick={handleCheckIn}
          disabled={!selectedRate || !playerName.trim()}
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
