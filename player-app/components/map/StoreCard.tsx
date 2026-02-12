'use client'

import { useRouter } from 'next/navigation'
import type { StoreWithStatus } from '@/lib/types'
import { getStatusText } from '@/lib/storeStatus'

interface StoreCardProps {
  store: StoreWithStatus
}

export default function StoreCard({ store }: StoreCardProps) {
  const router = useRouter()

  const handleClick = () => {
    router.push(`/store/${store.id}`)
  }

  return (
    <button
      onClick={handleClick}
      className="w-full bg-white rounded-lg p-4 shadow hover:shadow-md transition-shadow text-left"
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{store.name}</h3>
          <div className="text-sm text-gray-600 mt-1">
            {store.rates.join(' / ')}
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold">
            {getStatusText(store.status)}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            待ち: {store.waitlist.filter(w => w.status === 'waiting').length}人
          </div>
        </div>
      </div>
    </button>
  )
}
