'use client'

import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps'
import { useTranslations } from 'next-intl'
import type { StoreWithStatus } from '@/lib/types'

interface MapViewProps {
  stores: StoreWithStatus[]
  center?: { lat: number; lng: number }
  onStoreClick?: (storeId: string) => void
}

export default function MapView({ stores, center, onStoreClick }: MapViewProps) {
  const t = useTranslations('map.status')
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  const defaultCenter = center || { lat: 25.0330, lng: 121.5654 }

  const getMarkerColor = (status: StoreWithStatus['status']) => {
    switch (status) {
      case 'green':
        return '#10b981'
      case 'yellow':
        return '#f59e0b'
      case 'red':
        return '#ef4444'
      default:
        return '#6b7280'
    }
  }

  const getStatusLabel = (status: StoreWithStatus['status']) => {
    switch (status) {
      case 'green':
        return t('green')
      case 'yellow':
        return t('yellow')
      case 'red':
        return t('red')
      default:
        return ''
    }
  }

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        style={{ width: '100%', height: '100%' }}
        defaultCenter={defaultCenter}
        defaultZoom={13}
        gestureHandling="greedy"
        disableDefaultUI={false}
        mapId="tpds-map"
      >
        {stores.map((store) => {
          const waitingCount = store.waitlist.filter(w => w.status === 'waiting').length
          const statusLabel = getStatusLabel(store.status)
          const markerTitle = `${store.name} - ${statusLabel} - ${waitingCount}人待ち`

          return (
            <AdvancedMarker
              key={store.id}
              position={store.location}
              onClick={() => onStoreClick?.(store.id)}
              title={markerTitle}
            >
              <Pin
                background={getMarkerColor(store.status)}
                borderColor="#fff"
                glyphColor="#fff"
                scale={1.2}
              />
            </AdvancedMarker>
          )
        })}
      </Map>
    </APIProvider>
  )
}
