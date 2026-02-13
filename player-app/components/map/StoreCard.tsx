'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import type { StoreWithStatus } from '@/lib/types'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

interface StoreCardProps {
  store: StoreWithStatus
}

export default function StoreCard({ store }: StoreCardProps) {
  const router = useRouter()
  const t = useTranslations('map.status')
  const tStore = useTranslations('store')

  const handleClick = () => {
    router.push(`/store/${store.id}`)
  }

  const waitingCount = store.waitlist.filter(w => w.status === 'waiting').length

  const statusConfig = {
    green: { variant: 'success' as const, text: t('green') },
    yellow: { variant: 'warning' as const, text: t('yellow') },
    red: { variant: 'danger' as const, text: t('red') }
  }

  const status = statusConfig[store.status]

  return (
    <Card padding="none" className="overflow-hidden">
      <button
        onClick={handleClick}
        className="w-full p-4 text-left transition-all active:scale-95 hover:bg-gray-50"
        aria-label={`${store.name} - ${status.text} - ${tStore('peopleWaiting', { count: waitingCount })}`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800">{store.name}</h3>
            <div className="text-sm text-gray-600 mt-1">
              {store.rates.join(' / ')}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant={status.variant}>
              {status.text}
            </Badge>
            <div className="text-sm text-gray-600">
              {tStore('peopleWaiting', { count: waitingCount })}
            </div>
          </div>
        </div>
      </button>
    </Card>
  )
}
