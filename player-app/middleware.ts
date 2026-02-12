import createMiddleware from 'next-intl/middleware'

export default createMiddleware({
  // サポートするロケール
  locales: ['ja', 'zh-TW', 'en'],

  // デフォルトロケール
  defaultLocale: 'zh-TW'
})

export const config = {
  // i18nルーティングを適用するパス
  matcher: ['/', '/(ja|zh-TW|en)/:path*']
}
