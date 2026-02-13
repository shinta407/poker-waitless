import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { Header } from '@/components/layout/Header'

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const messages = await getMessages()

  const showMockMode = process.env.NEXT_PUBLIC_USE_MOCK_MODE === 'true'

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Header showMockMode={showMockMode} />
      <main className="pt-16">
        {children}
      </main>
    </NextIntlClientProvider>
  )
}
