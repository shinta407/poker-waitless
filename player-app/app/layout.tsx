'use client'

import { useEffect, useState } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import './globals.css'

// 翻訳メッセージのインポート
import jaMessages from '@/messages/ja.json'
import zhTWMessages from '@/messages/zh-TW.json'
import enMessages from '@/messages/en.json'

const messages = {
  'ja': jaMessages,
  'zh-TW': zhTWMessages,
  'en': enMessages,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isReady, setIsReady] = useState(false)
  const locale = 'zh-TW' // デフォルトロケール

  useEffect(() => {
    // モックモード: LIFF初期化をスキップ
    const useMockMode = process.env.NEXT_PUBLIC_USE_MOCK_MODE === 'true'

    if (useMockMode) {
      console.log('🎭 モックモード: LIFF初期化をスキップ')
      setIsReady(true)
    } else {
      // 本番モード: LIFF初期化（後で実装）
      // await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID })
      console.log('⚠️ LIFF未実装: モックモードで動作中')
      setIsReady(true)
    }
  }, [])

  if (!isReady) {
    return (
      <html lang={locale}>
        <body>
          <div className="flex items-center justify-center h-screen">
            <div className="text-2xl">讀取中...</div>
          </div>
        </body>
      </html>
    )
  }

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages[locale]}>
          {/* モックモードバナー */}
          {process.env.NEXT_PUBLIC_USE_MOCK_MODE === 'true' && (
            <div className="bg-yellow-400 text-black px-4 py-2 text-center font-bold">
              🎭 モックモード（LIFF未接続）
            </div>
          )}
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
