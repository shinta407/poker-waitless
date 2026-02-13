'use client'

import { useEffect, useRef } from 'react'

interface RateTabsProps {
  rates: string[]
  selectedRate: string
  onRateChange: (rate: string) => void
  storeName: string
}

export default function RateTabs({ rates, selectedRate, onRateChange, storeName }: RateTabsProps) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const currentIndex = rates.indexOf(selectedRate)
      let nextIndex = currentIndex

      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        nextIndex = currentIndex > 0 ? currentIndex - 1 : rates.length - 1
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        nextIndex = currentIndex < rates.length - 1 ? currentIndex + 1 : 0
      } else {
        return
      }

      onRateChange(rates[nextIndex])
      tabRefs.current[nextIndex]?.focus()
    }

    // Add listener to active tab
    const activeTab = tabRefs.current[rates.indexOf(selectedRate)]
    activeTab?.addEventListener('keydown', handleKeyDown)

    return () => {
      activeTab?.removeEventListener('keydown', handleKeyDown)
    }
  }, [rates, selectedRate, onRateChange])

  return (
    <div className="h-20 bg-white border-b-4 border-gray-300 flex items-center justify-between px-6 shadow-sm">
      {/* Rate Tabs */}
      <nav role="tablist" aria-label="レート選択" className="flex gap-3">
        {rates.map((rate, index) => (
          <button
            key={rate}
            ref={(el) => {
              tabRefs.current[index] = el
            }}
            role="tab"
            aria-selected={selectedRate === rate}
            aria-controls={`${rate}-panel`}
            tabIndex={selectedRate === rate ? 0 : -1}
            onClick={() => onRateChange(rate)}
            className={`
              px-8 py-4 text-3xl font-bold rounded-lg transition-all
              min-w-[140px] h-16
              focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-sky-500 focus-visible:ring-offset-2
              ${
                selectedRate === rate
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            {rate}
          </button>
        ))}
      </nav>

      {/* Store Name */}
      <div className="text-2xl font-semibold text-gray-700" role="status" aria-label={`現在の店舗: ${storeName}`}>
        店舗: {storeName}
      </div>
    </div>
  )
}
