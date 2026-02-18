'use client'

import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { getPlayerId } from '@/lib/playerProfile'

interface PlayerQRCodeProps {
  size?: number
}

export function PlayerQRCode({ size = 220 }: PlayerQRCodeProps) {
  const [qrValue, setQrValue] = useState<string | null>(null)

  useEffect(() => {
    const id = getPlayerId()
    setQrValue(`tpds://player/${id}`)
  }, [])

  if (!qrValue) return null

  return (
    <div className="flex justify-center p-4">
      <QRCodeSVG value={qrValue} size={size} />
    </div>
  )
}
