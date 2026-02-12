interface RateTabsProps {
  rates: string[]
  selectedRate: string
  onRateChange: (rate: string) => void
  storeName: string
}

export default function RateTabs({ rates, selectedRate, onRateChange, storeName }: RateTabsProps) {
  return (
    <div className="h-20 bg-white border-b-4 border-gray-300 flex items-center justify-between px-6 shadow-sm">
      {/* Rate Tabs */}
      <div className="flex gap-3">
        {rates.map((rate) => (
          <button
            key={rate}
            onClick={() => onRateChange(rate)}
            className={`
              px-8 py-4 text-3xl font-bold rounded-lg transition-all
              min-w-[140px] h-16
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
      </div>

      {/* Store Name */}
      <div className="text-2xl font-semibold text-gray-700">
        店舗: {storeName}
      </div>
    </div>
  )
}
