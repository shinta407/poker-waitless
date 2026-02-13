import type { Metadata } from 'next'
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>{children}</body>
    </html>
  )
}
