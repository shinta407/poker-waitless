'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import MapView from '@/components/map/MapView'
import StoreCard from '@/components/map/StoreCard'
import { useRealtimeStores } from '@/hooks/useRealtimeStores'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Loader } from '@/components/ui/Loader'

export default function MapPage() {
  const t = useTranslations('map')
  const tCommon = useTranslations('common')
  const { stores, loading } = useRealtimeStores()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRate, setSelectedRate] = useState<string>('all')

  const filteredStores = useMemo(() => {
    return stores.filter(store => {
      if (searchQuery && !store.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }

      if (selectedRate !== 'all' && !store.rates.includes(selectedRate)) {
        return false
      }

      return true
    })
  }, [stores, searchQuery, selectedRate])

  // すべての店舗のレートを動的に取得
  const rates = useMemo(() => {
    const allRates = new Set<string>()
    stores.forEach(store => {
      store.rates.forEach(rate => allRates.add(rate))
    })
    return Array.from(allRates).sort()
  }, [stores])

  if (loading) {
    return <Loader fullScreen text={tCommon('loading')} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-16 z-10">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">{t('title')}</h1>

          <Input
            type="text"
            placeholder={t('search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label={t('search')}
            className="mb-3"
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />

          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              onClick={() => setSelectedRate('all')}
              variant={selectedRate === 'all' ? 'primary' : 'secondary'}
              size="md"
              aria-label={t('filter.all')}
            >
              {t('filter.all')}
            </Button>
            {rates.map(rate => (
              <Button
                key={rate}
                onClick={() => setSelectedRate(rate)}
                variant={selectedRate === rate ? 'primary' : 'secondary'}
                size="md"
                aria-label={`${t('filter.rate')} ${rate}`}
              >
                {rate}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="h-96 rounded-lg overflow-hidden mb-4">
          <MapView
            stores={filteredStores}
            onStoreClick={(storeId) => window.location.href = `/store/${storeId}`}
          />
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-700">{t('storeList')}</h2>
          {filteredStores.map(store => (
            <StoreCard key={store.id} store={store} />
          ))}

          {filteredStores.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {t('noStoresFound')}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
