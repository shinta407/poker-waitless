'use client'

import { useEffect } from 'react'
import { useLanguageStore } from '@/lib/languageStore'

/**
 * Updates the HTML lang attribute when locale changes
 * for accessibility and SEO purposes
 */
export function HtmlLangUpdater() {
  const { locale } = useLanguageStore()

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale
    }
  }, [locale])

  return null
}
