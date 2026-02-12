'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // ルートページから MAP 画面へリダイレクト
    router.push('/map')
  }, [router])

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-xl">リダイレクト中...</div>
    </div>
  )
}
