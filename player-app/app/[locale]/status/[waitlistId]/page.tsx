'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { useMyWaitlistEntry } from '@/hooks/useMyWaitlistEntry'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Loader } from '@/components/ui/Loader'
import { PlayerQRCode } from '@/components/ui/PlayerQRCode'

export default function StatusPage() {
  const params = useParams()
  const router = useRouter()
  const t = useTranslations('status')
  const tCommon = useTranslations('common')
  const locale = useLocale()
  const waitlistId = params.waitlistId as string
  const [cancelling, setCancelling] = useState(false)

  const { entry, store, position, loading } = useMyWaitlistEntry(waitlistId)

  const handleCancel = async () => {
    if (!confirm(t('cancelButton') + '?')) return

    setCancelling(true)
    const useMockMode = process.env.NEXT_PUBLIC_USE_MOCK_MODE === 'true'

    const mapPath = locale === 'zh-TW' ? '/map' : `/${locale}/map`

    if (useMockMode) {
      console.log('✅ キャンセル（モック）:', waitlistId)
      alert(t('cancelSuccess'))
      router.push(mapPath)
    } else {
      try {
        const { error } = await supabase
          .from('waitlist')
          .update({ status: 'cancelled' })
          .eq('id', waitlistId)

        if (error) throw error

        console.log('✅ キャンセル成功')
        alert(t('cancelSuccess'))
        router.push(mapPath)
      } catch (error) {
        console.error('❌ キャンセルエラー:', error)
        alert(tCommon('error'))
        setCancelling(false)
      }
    }
  }

  if (loading || !entry || !store) {
    return <Loader fullScreen text={tCommon('loading')} />
  }

  const estimatedCallTime = new Date(
    new Date(entry.created_at).getTime() +
      (entry.arrival_estimation_minutes || 0) * 60000 +
      position * 20 * 60000
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b p-4">
        <h1 className="text-2xl font-bold text-gray-800">{t('title')}</h1>
        <div className="text-gray-600 mt-1">
          {store.name} - {entry.rate_preference}
        </div>
      </div>

      <div className="p-4 space-y-6">
        <Card variant="elevated" padding="lg">
          <div className="text-center">
            <h2 className="text-xl text-gray-600 mb-4">
              {t('currentPosition')}
            </h2>
            <div
              className="text-8xl font-bold text-blue-600 mb-4"
              aria-live="polite"
              aria-atomic="true"
            >
              #{position}
            </div>
            {position === 1 && (
              <div className="text-green-600 font-bold text-xl">
                {t('almostYourTurn')}
              </div>
            )}
          </div>
        </Card>

        <Card padding="lg">
          <div className="text-gray-700 mb-2">{t('estimatedCallTime')}</div>
          <div className="text-3xl font-bold text-gray-800">
            {estimatedCallTime.toLocaleTimeString(undefined, {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
          <div className="text-sm text-gray-500 mt-2">
            {t('estimateDisclaimer')}
          </div>
        </Card>

        <Card padding="lg" className="bg-blue-50">
          <div className="flex items-center gap-2">
            <div className="text-2xl">🔔</div>
            <div>
              <div className="font-bold text-gray-800">{t('notificationEnabled')}</div>
              <div className="text-sm text-gray-600">
                {t('called.message')}
              </div>
            </div>
          </div>
        </Card>

        <Card padding="lg">
          <div className="text-center text-sm text-gray-500 mb-2">{t('qrHint')}</div>
          <PlayerQRCode size={160} />
        </Card>

        <Button
          onClick={handleCancel}
          variant="danger"
          size="xl"
          fullWidth
          loading={cancelling}
          disabled={cancelling}
        >
          {t('cancelButton')}
        </Button>
      </div>
    </div>
  )
}
