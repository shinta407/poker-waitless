'use client'

import { LanguageSelector } from '../ui/LanguageSelector'
import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'

interface HeaderProps {
  showMockMode?: boolean
}

export function Header({ showMockMode = false }: HeaderProps) {
  const t = useTranslations('common')
  const locale = useLocale()
  const qrPath = locale === 'zh-TW' ? '/qr' : `/${locale}/qr`

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold">Poker Waitless</h1>
          {showMockMode && (
            <span className="text-xs px-2 py-1 bg-purple-600 rounded-full">
              {t('mockMode')}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={qrPath}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="QR Code"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 3.5V16M4 4h4v4H4V4zm12 0h4v4h-4V4zM4 16h4v4H4v-4z" />
            </svg>
          </Link>
          <LanguageSelector />
        </div>
      </div>
    </header>
  )
}
