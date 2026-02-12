'use client'

import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps'
import type { StoreWithStatus } from '@/lib/types'

interface MapViewProps {
  stores: StoreWithStatus[]
  center?: { lat: number; lng: number }
  onStoreClick?: (storeId: string) => void
}

export default function MapView({ stores, center, onStoreClick }: MapViewProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  const defaultCenter = center || { lat: 25.0330, lng: 121.5654 } // 台北市中心

  const getMarkerColor = (status: StoreWithStatus['status']) => {
    switch (status) {
      case 'green':
        return '#22c55e' // green-500
      case 'yellow':
        return '#eab308' // yellow-500
      case 'red':
        return '#ef4444' // red-500
      default:
        return '#6b7280' // gray-500
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
        {stores.map((store) => (
          <AdvancedMarker
            key={store.id}
            position={store.location}
            onClick={() => onStoreClick?.(store.id)}
          >
            <Pin
              background={getMarkerColor(store.status)}
              borderColor="#fff"
              glyphColor="#fff"
              scale={1.2}
            />
          </AdvancedMarker>
        ))}
      </Map>
    </APIProvider>
  )
}
