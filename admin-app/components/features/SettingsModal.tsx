'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Modal } from '@/components/ui/Modal'
import { BuyInSettings } from './BuyInSettings'
import { TablesSettings } from './TablesSettings'
import { LanguageSelector } from './LanguageSelector'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  storeId: string
  buyIns: string[]
  onBuyInsUpdate: (newBuyIns: string[]) => void
}

type TabType = 'buyins' | 'tables' | 'language'

export function SettingsModal({
  isOpen,
  onClose,
  storeId,
  buyIns,
  onBuyInsUpdate,
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('buyins')
  const t = useTranslations()

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('settings.title')}
      size="large"
      closeOnEscape={true}
    >
      <div className="space-y-4">
        {/* Tab Navigation */}
        <div className="border-b-2 border-gray-200" role="tablist" aria-label={t('settings.title')}>
          <div className="flex gap-1">
            <button
              role="tab"
              aria-selected={activeTab === 'buyins'}
              aria-controls="buyins-panel"
              onClick={() => setActiveTab('buyins')}
              className={`
                px-6 py-3 text-lg font-semibold rounded-t-lg transition-all
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2
                ${
                  activeTab === 'buyins'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {t('settings.buyInSettings')}
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'tables'}
              aria-controls="tables-panel"
              onClick={() => setActiveTab('tables')}
              className={`
                px-6 py-3 text-lg font-semibold rounded-t-lg transition-all
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2
                ${
                  activeTab === 'tables'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {t('settings.tablesSettings')}
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'language'}
              aria-controls="language-panel"
              onClick={() => setActiveTab('language')}
              className={`
                px-6 py-3 text-lg font-semibold rounded-t-lg transition-all
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2
                ${
                  activeTab === 'language'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {t('language.select')}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'buyins' && (
            <div
              role="tabpanel"
              id="buyins-panel"
              aria-labelledby="buyins-tab"
            >
              <BuyInSettings
                storeId={storeId}
                buyIns={buyIns}
                onBuyInsUpdate={onBuyInsUpdate}
              />
            </div>
          )}
          {activeTab === 'tables' && (
            <div
              role="tabpanel"
              id="tables-panel"
              aria-labelledby="tables-tab"
            >
              <TablesSettings
                storeId={storeId}
                buyIns={buyIns}
              />
            </div>
          )}
          {activeTab === 'language' && (
            <div
              role="tabpanel"
              id="language-panel"
              aria-labelledby="language-tab"
            >
              <LanguageSelector />
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
