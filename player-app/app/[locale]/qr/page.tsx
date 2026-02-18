'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { PlayerQRCode } from '@/components/ui/PlayerQRCode'
import { getPlayerName, savePlayerName } from '@/lib/playerProfile'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function QRPage() {
  const t = useTranslations('qr')
  const [name, setName] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setName(getPlayerName())
  }, [])

  const handleSave = () => {
    savePlayerName(name.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-sm mx-auto space-y-6">
        <Card padding="lg">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{t('title')}</h1>
          <p className="text-gray-600 text-sm mb-4">{t('description')}</p>
          <PlayerQRCode size={220} />
        </Card>

        <Card padding="lg">
          <div className="space-y-3">
            <Input
              label={t('yourName')}
              placeholder={t('namePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Button
              onClick={handleSave}
              variant="primary"
              size="lg"
              fullWidth
              disabled={!name.trim()}
            >
              {saved ? t('nameSaved') : t('saveName')}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
