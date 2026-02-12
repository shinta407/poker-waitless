// next-intlのミドルウェアを一時的に無効化（デモ版用）
// LIFF統合時に再度有効化予定

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}

// --- LIFF統合時に以下を使用 ---
// import createMiddleware from 'next-intl/middleware'
//
// export default createMiddleware({
//   locales: ['ja', 'zh-TW', 'en'],
//   defaultLocale: 'zh-TW'
// })
//
// export const config = {
//   matcher: ['/', '/(ja|zh-TW|en)/:path*']
// }
