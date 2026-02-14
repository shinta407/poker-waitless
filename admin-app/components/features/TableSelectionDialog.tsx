'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { type Table, type WaitlistEntry } from '@/lib/supabase'

interface TableSelectionDialogProps {
  isOpen: boolean
  onClose: () => void
  player: WaitlistEntry | null
  tables: Table[]
  onSelectTable: (tableId: string) => Promise<void>
}

export function TableSelectionDialog({
  isOpen,
  onClose,
  player,
  tables,
  onSelectTable,
}: TableSelectionDialogProps) {
  const [selectedTableId, setSelectedTableId] = useState<string>('')
  const [loading, setLoading] = useState(false)

  if (!player) return null

  // Filter tables by matching buy-in and availability
  const availableTables = tables.filter(
    (table) =>
      table.rate === player.rate_preference &&
      table.status === 'open' &&
      table.current_players < table.max_seats
  )

  const handleSubmit = async () => {
    if (!selectedTableId) return

    try {
      setLoading(true)
      await onSelectTable(selectedTableId)
      setSelectedTableId('')
      // Dialog will be closed by parent component on success
    } catch (error) {
      console.error('Error seating player:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="テーブルを選択"
      size="medium"
      closeOnEscape={true}
    >
      <div className="space-y-4">
        {/* Player Info */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">プレイヤー</div>
          <div className="text-2xl font-bold text-gray-900">{player.user_name}</div>
          <div className="text-lg text-gray-700 mt-1">
            希望買入額: <span className="font-semibold text-blue-600">{player.rate_preference}</span>
          </div>
        </div>

        {/* Available Tables */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">利用可能なテーブル</h3>
          {availableTables.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              利用可能なテーブルがありません
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {availableTables.map((table) => {
                const isSelected = selectedTableId === table.id
                const occupancyRate = (table.current_players / table.max_seats) * 100
                const isMostlyFull = occupancyRate >= 80

                return (
                  <button
                    key={table.id}
                    onClick={() => setSelectedTableId(table.id)}
                    className={`
                      w-full p-4 rounded-lg border-2 transition-all text-left
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500
                      ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 bg-white'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-gray-900">
                            テーブル {table.id.slice(0, 8)}
                          </span>
                          <span
                            className={`
                              text-sm font-semibold px-2 py-1 rounded
                              ${
                                isMostlyFull
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-green-100 text-green-700'
                              }
                            `}
                          >
                            {table.current_players}/{table.max_seats}席
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          空席: {table.max_seats - table.current_players}席
                        </div>
                      </div>

                      {/* Selection Indicator */}
                      <div
                        className={`
                          w-6 h-6 rounded-full border-2 flex items-center justify-center
                          ${
                            isSelected
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300'
                          }
                        `}
                      >
                        {isSelected && (
                          <svg
                            className="w-4 h-4 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="ghost"
            size="large"
            onClick={onClose}
            className="flex-1"
            disabled={loading}
          >
            キャンセル
          </Button>
          <Button
            variant="primary"
            size="large"
            onClick={handleSubmit}
            className="flex-1"
            disabled={!selectedTableId || availableTables.length === 0}
            loading={loading}
          >
            着席
          </Button>
        </div>
      </div>
    </Modal>
  )
}
