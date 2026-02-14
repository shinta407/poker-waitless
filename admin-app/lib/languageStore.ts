import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Locale } from '@/i18n'

interface LanguageState {
  locale: Locale
  setLocale: (locale: Locale) => void
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      locale: 'zh-TW', // Default to Traditional Chinese for Taiwan poker
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: 'admin-language-storage',
    }
  )
)
