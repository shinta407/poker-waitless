import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  // Fallback to default locale if not provided
  if (!locale) {
    locale = 'zh-TW'
  }

  // Ensure locale is valid
  const validLocales = ['ja', 'zh-TW', 'en']
  if (!validLocales.includes(locale)) {
    locale = 'zh-TW'
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  }
})
