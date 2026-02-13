import createMiddleware from 'next-intl/middleware'

export default createMiddleware({
  locales: ['ja', 'zh-TW', 'en'],
  defaultLocale: 'zh-TW',
  localePrefix: 'as-needed'
})

export const config = {
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
}
