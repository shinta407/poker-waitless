'use client'

import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useMyWaitlistEntry } from '@/hooks/useMyWaitlistEntry'
import { supabase } from '@/lib/supabase'

export default function StatusPage() {
  const params = useParams()
  const router = useRouter()
  const t = useTranslations('status')
  const waitlistId = params.waitlistId as string

  // リアルタイムフック使用
  const { entry, store, position, loading } = useMyWaitlistEntry(waitlistId)

  const handleCancel = async () => {
    const useMockMode = process.env.NEXT_PUBLIC_USE_MOCK_MODE === 'true'

    if (useMockMode) {
      console.log('✅ キャンセル（モック）:', waitlistId)
      alert('チェックインをキャンセルしました')
      router.push('/map')
    } else {
      try {
        const { error } = await supabase
          .from('waitlist')
          .update({ status: 'cancelled' })
          .eq('id', waitlistId)

        if (error) throw error

        console.log('✅ キャンセル成功')
        router.push('/map')
      } catch (error) {
        console.error('❌ キャンセルエラー:', error)
        alert('キャンセルに失敗しました')
      }
    }
  }

  if (loading || !entry || !store) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">読み込み中...</div>
      </div>
    )
  }

  // 予測呼び出し時刻（到着時間 + 待ち時間）
  const estimatedCallTime = new Date(
    new Date(entry.created_at).getTime() +
      (entry.arrival_estimation_minutes || 0) * 60000 +
      position * 20 * 60000 // 1人あたり20分と仮定
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b p-4">
        <h1 className="text-2xl font-bold text-gray-800">{t('title')}</h1>
        <div className="text-gray-600 mt-1">
          {store.name} - {entry.rate_preference}
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* 待ち順位カード */}
        <div className="bg-white rounded-xl p-8 text-center shadow-lg">
          <h2 className="text-xl text-gray-600 mb-4">
            {t('currentPosition')}
          </h2>
          <div className="text-8xl font-bold text-blue-600 mb-4">
            #{position}
          </div>
          {position === 1 && (
            <div className="text-green-600 font-bold text-xl">
              もうすぐ順番です！
            </div>
          )}
        </div>

        {/* 予測呼び出し時刻 */}
        <div className="bg-white rounded-lg p-4">
          <div className="text-gray-700 mb-2">🕐 呼び出し予測時刻</div>
          <div className="text-3xl font-bold text-gray-800">
            {estimatedCallTime.toLocaleTimeString('ja-JP', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
          <div className="text-sm text-gray-500 mt-2">
            ※ 目安です。実際の状況により変動します
          </div>
        </div>

        {/* 通知ステータス */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="text-2xl">🔔</div>
            <div>
              <div className="font-bold text-gray-800">LINE通知: 有効</div>
              <div className="text-sm text-gray-600">
                順番が来たら通知します
              </div>
            </div>
          </div>
        </div>

        {/* キャンセルボタン */}
        <button
          onClick={handleCancel}
          className="w-full bg-red-500 hover:bg-red-600 text-white
                     py-4 rounded-xl font-bold text-xl
                     transition-all active:scale-95"
        >
          {t('cancelButton')}
        </button>
      </div>
    </div>
  )
}
