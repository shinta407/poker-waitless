'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

export default function GuidePage() {
  const router = useRouter()
  const t = useTranslations('guide')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b p-4">
        <button
          onClick={() => router.back()}
          className="text-blue-500 mb-2"
        >
          ← 戻る
        </button>
        <h1 className="text-2xl font-bold text-gray-800">{t('title')}</h1>
      </div>

      <div className="p-6 space-y-8">
        {/* ステップ1 */}
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl">🗺️</div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                {t('step1')}
              </h2>
              <p className="text-gray-600">
                空席マップで台北市内のポーカー店舗を探せます。
                信号機の色で混雑状況が一目で分かります。
              </p>
            </div>
          </div>
        </div>

        {/* ステップ2 */}
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl">✅</div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                {t('step2')}
              </h2>
              <p className="text-gray-600">
                お好みのレートと到着時間を選択して、
                リモートでチェックインできます。
              </p>
            </div>
          </div>
        </div>

        {/* ステップ3 */}
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl">⏳</div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                {t('step3')}
              </h2>
              <p className="text-gray-600">
                マイステータス画面で現在の待ち順位と
                呼び出し予測時刻を確認できます。
              </p>
            </div>
          </div>
        </div>

        {/* ステップ4 */}
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl">🔔</div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                {t('step4')}
              </h2>
              <p className="text-gray-600">
                順番が来たらLINEに通知が届きます。
                店舗に向かってください！
              </p>
            </div>
          </div>
        </div>

        {/* 信号機の説明 */}
        <div className="bg-white rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            信号機の見方
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🟢</div>
              <div>
                <div className="font-bold">緑 - 空席あり</div>
                <div className="text-sm text-gray-600">すぐに座れます</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-2xl">🟡</div>
              <div>
                <div className="font-bold">黄 - 少し待ち</div>
                <div className="text-sm text-gray-600">3人以内の待ち</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-2xl">🔴</div>
              <div>
                <div className="font-bold">赤 - 混雑中</div>
                <div className="text-sm text-gray-600">4人以上待ち</div>
              </div>
            </div>
          </div>
        </div>

        {/* MAP画面へ戻るボタン */}
        <button
          onClick={() => router.push('/map')}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white
                     py-4 rounded-xl font-bold text-xl
                     transition-all active:scale-95"
        >
          マップを見る
        </button>
      </div>
    </div>
  )
}
