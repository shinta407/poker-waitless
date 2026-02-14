'use client'

import { Languages } from 'lucide-react'
import { useLanguageStore } from '@/lib/languageStore'
import type { Locale } from '@/i18n'

const languages: { code: Locale; name: string; nativeName: string }[] = [
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'zh-TW', name: 'Traditional Chinese', nativeName: '繁體中文' },
  { code: 'zh-CN', name: 'Simplified Chinese', nativeName: '简体中文' },
  { code: 'en', name: 'English', nativeName: 'English' },
]

interface LanguageSelectorProps {
  className?: string
}

export function LanguageSelector({ className = '' }: LanguageSelectorProps) {
  const { locale, setLocale } = useLanguageStore()

  const handleLanguageChange = (newLocale: Locale) => {
    setLocale(newLocale)
    // Reload the page to apply new locale
    window.location.reload()
  }

  const currentLanguage = languages.find((lang) => lang.code === locale)

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-700">
        <Languages className="w-4 h-4" aria-hidden="true" />
        <span>Language / 語言 / 언어</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`
              px-4 py-3 rounded-lg text-left transition-all
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500
              ${
                locale === lang.code
                  ? 'bg-blue-500 text-white font-semibold'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
            aria-label={`Switch to ${lang.name}`}
          >
            <div className="text-sm font-medium">{lang.nativeName}</div>
            <div className="text-xs opacity-80">{lang.name}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
