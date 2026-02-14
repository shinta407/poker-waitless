/**
 * 言語設定の一元管理ファイル
 * Centralized language configuration
 */

export type Locale = 'zh-TW' | 'zh-CN' | 'ja' | 'en'

export interface LanguageConfig {
  code: Locale
  label: string
  flag: string
}

export const languages: LanguageConfig[] = [
  { code: 'zh-TW', label: '繁體中文', flag: '🇹🇼' },
  { code: 'zh-CN', label: '简体中文', flag: '🇨🇳' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'en', label: 'English', flag: '🇺🇸' }
] as const

export const defaultLocale: Locale = 'zh-TW'

// すべてのロケールコードを配列として取得
export const locales: Locale[] = languages.map(lang => lang.code)

// ロケールの正規表現パターン（LanguageSelectorで使用）
export const localePattern = new RegExp(`^/(${locales.join('|')})`)
