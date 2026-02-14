'use client'

import { NextIntlClientProvider } from 'next-intl'
import { useEffect, useState } from 'react'
import { useLanguageStore } from '@/lib/languageStore'

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { locale } = useLanguageStore()
  const [messages, setMessages] = useState<any>(null)

  useEffect(() => {
    // Load messages dynamically based on locale
    import(`@/messages/${locale}.json`)
      .then((module) => setMessages(module.default))
      .catch((error) => {
        console.error(`Failed to load messages for locale ${locale}:`, error)
        // Fallback to Japanese
        import(`@/messages/ja.json`).then((module) => setMessages(module.default))
      })
  }, [locale])

  // Show nothing until messages are loaded
  if (!messages) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}
