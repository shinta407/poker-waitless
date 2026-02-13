import createMiddleware from 'next-intl/middleware'

export default createMiddleware({
  locales: ['ja', 'zh-TW', 'en'],
  defaultLocale: 'zh-TW',
  localePrefix: 'as-needed'
})

export const config = {
  matcher: ['/', '/(ja|zh-TW|en)/:path*', '/((?!api|_next|.*\\..*).*)']
}
