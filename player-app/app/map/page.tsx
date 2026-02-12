'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import MapView from '@/components/map/MapView'
import StoreCard from '@/components/map/StoreCard'
import { useRealtimeStores } from '@/hooks/useRealtimeStores'

export default function MapPage() {
  const t = useTranslations('map')
  const { stores, loading } = useRealtimeStores()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRate, setSelectedRate] = useState<string>('all')

  // フィルタリングされた店舗リスト
  const filteredStores = useMemo(() => {
    return stores.filter(store => {
      // 検索クエリでフィルター
      if (searchQuery && !store.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }

      // レートでフィルター
      if (selectedRate !== 'all' && !store.rates.includes(selectedRate)) {
        return false
      }

      return true
    })
  }, [stores, searchQuery, selectedRate])

  const rates = ['1/3', '2/5', '5/10+', '10/20']

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">{t('common.loading')}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">{t('title')}</h1>

          {/* 検索バー */}
          <input
            type="text"
            placeholder={t('search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg mb-3"
          />

          {/* レートフィルター */}
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setSelectedRate('all')}
              className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                selectedRate === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {t('filter.all')}
            </button>
            {rates.map(rate => (
              <button
                key={rate}
                onClick={() => setSelectedRate(rate)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap ${
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
      </div>

      {/* Google Maps */}
      <div className="p-4">
        <div className="h-96 rounded-lg overflow-hidden mb-4">
          <MapView
            stores={filteredStores}
            onStoreClick={(storeId) => window.location.href = `/store/${storeId}`}
          />
        </div>

        {/* 店舗リスト */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-700">店舗リスト</h2>
          {filteredStores.map(store => (
            <StoreCard key={store.id} store={store} />
          ))}

          {filteredStores.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              該当する店舗が見つかりません
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
