import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async () => {
  // デフォルトは中国語（繁体字）
  const locale = 'zh-TW'

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  }
})
