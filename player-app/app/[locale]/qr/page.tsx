'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { PlayerQRCode } from '@/components/ui/PlayerQRCode'
import { getPlayerName, savePlayerName } from '@/lib/playerProfile'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'

export default function QRPage() {
  const router = useRouter()
  const t = useTranslations('qr')
  const tCommon = useTranslations('common')
  const [name, setName] = useState('')
  const [savedName, setSavedName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const stored = getPlayerName()
    setName(stored)
    setSavedName(stored)
  }, [])

  const handleSave = () => {
    const trimmed = name.trim()
    console.log('[QR] handleSave called, name:', JSON.stringify(name), 'trimmed:', JSON.stringify(trimmed))
    setSaving(true)
    savePlayerName(trimmed)
    setSavedName(trimmed)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  console.log('[QR] render - savedName:', JSON.stringify(savedName), 'name:', JSON.stringify(name))

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-sm mx-auto space-y-6">
        <Card padding="lg">
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
            {savedName && (
              <span className="ml-auto text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                {t('qrActive')}
              </span>
            )}
          </div>
          <p className="text-gray-600 text-sm mb-4">{t('description')}</p>
          <PlayerQRCode name={savedName} size={220} />
          {!savedName && (
            <p className="text-center text-xs text-amber-600 mt-2">{t('nameRequired')}</p>
          )}
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
              disabled={!name.trim() || saving}
            >
              {saving ? t('registering') : saved ? t('nameSaved') : t('saveName')}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
