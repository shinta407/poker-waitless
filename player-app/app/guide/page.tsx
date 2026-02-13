'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'
import { Badge } from '@/components/ui/Badge'

export default function GuidePage() {
  const router = useRouter()
  const t = useTranslations('guide')
  const tMap = useTranslations('map')
  const tCommon = useTranslations('common')

  const steps = [
    { icon: '🗺️', title: t('step1'), description: t('step1Description') },
    { icon: '✅', title: t('step2'), description: t('step2Description') },
    { icon: '⏳', title: t('step3'), description: t('step3Description') },
    { icon: '🔔', title: t('step4'), description: t('step4Description') }
  ]

  const trafficLights = [
    { icon: '🟢', variant: 'success' as const, description: t('greenDescription') },
    { icon: '🟡', variant: 'warning' as const, description: t('yellowDescription') },
    { icon: '🔴', variant: 'danger' as const, description: t('redDescription') }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b p-4">
        <div className="flex items-center gap-3 mb-2">
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
          <h1 className="text-2xl font-bold text-gray-800">{t('title')}</h1>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {steps.map((step, index) => (
          <Card key={index} padding="lg">
            <div className="flex items-start gap-4">
              <div className="text-4xl">{step.icon}</div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  {step.title}
                </h2>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </div>
            </div>
          </Card>
        ))}

        <Card padding="lg">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {t('trafficLightTitle')}
          </h2>
          <div className="space-y-4">
            {trafficLights.map((light, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="text-2xl">{light.icon}</div>
                <div className="flex-1">
                  <Badge variant={light.variant} className="text-sm">
                    {light.description}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Button
          onClick={() => router.push('/map')}
          variant="primary"
          size="xl"
          fullWidth
        >
          {tMap('title')}
        </Button>
      </div>
    </div>
  )
}
