import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getLocale } from 'next-intl/server'
import { Header } from '@/components/layout/Header'
import './globals.css'

export const metadata: Metadata = {
  title: 'Poker Waitless - プレイヤー向けアプリ',
  description: 'ポーカーの待ち時間を快適に。店舗検索、待機状況、ゲーム案内',
  icons: {
    icon: '/favicon.ico',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = await getMessages()

  const showMockMode = process.env.NEXT_PUBLIC_USE_MOCK_MODE === 'true'

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Header showMockMode={showMockMode} />
          <main className="pt-16">
            {children}
          </main>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
