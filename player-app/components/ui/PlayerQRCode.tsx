'use client'

import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { getPlayerId } from '@/lib/playerProfile'

interface PlayerQRCodeProps {
  name: string
  size?: number
}

export function PlayerQRCode({ name, size = 220 }: PlayerQRCodeProps) {
  const [playerId, setPlayerId] = useState<string | null>(null)

  useEffect(() => {
    setPlayerId(getPlayerId())
  }, [])

  if (!playerId) return null

  const hasName = name.trim().length > 0
  const qrValue = hasName
    ? `tpds://player/${playerId}?name=${encodeURIComponent(name.trim())}`
    : `tpds://player/${playerId}`

  return (
    <div className="flex justify-center p-4 relative">
      <div className={hasName ? '' : 'relative'}>
        <QRCodeSVG value={qrValue} size={size} className={hasName ? '' : 'blur-sm'} />
        {!hasName && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/90 rounded-lg px-3 py-2 text-center shadow">
              <p className="text-sm font-medium text-gray-700">名前を保存してください</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
