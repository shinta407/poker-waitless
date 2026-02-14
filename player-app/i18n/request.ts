import { getRequestConfig } from 'next-intl/server'
import { locales, defaultLocale } from '../lib/i18n-config'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  // Fallback to default locale if not provided
  if (!locale) {
    locale = defaultLocale
  }

  // Ensure locale is valid
  if (!locales.includes(locale as any)) {
    locale = defaultLocale
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  }
})
