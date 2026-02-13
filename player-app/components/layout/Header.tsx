'use client'

import { LanguageSelector } from '../ui/LanguageSelector'
import { useTranslations } from 'next-intl'

interface HeaderProps {
  showMockMode?: boolean
}

export function Header({ showMockMode = false }: HeaderProps) {
  const t = useTranslations('common')

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

        <LanguageSelector />
      </div>
    </header>
  )
}
