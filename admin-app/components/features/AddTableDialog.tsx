'use client'

import { useState, useEffect, useRef } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { type Table } from '@/lib/supabase'

interface AddTableDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (table: Omit<Table, 'id' | 'store_id' | 'created_at' | 'updated_at'>) => Promise<void>
  mode: 'add' | 'edit'
  buyIns: string[]
  initialBuyIn?: string
  initialTable?: Table
}

export function AddTableDialog({
  isOpen,
  onClose,
  onSubmit,
  mode,
  buyIns,
  initialBuyIn = '',
  initialTable,
}: AddTableDialogProps) {
  const [buyIn, setBuyIn] = useState('')
  const [maxSeats, setMaxSeats] = useState(9)
  const [status, setStatus] = useState<'open' | 'closed'>('open')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const submittingRef = useRef(false)

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialTable) {
        setBuyIn(initialTable.rate)
        setMaxSeats(initialTable.max_seats)
        setStatus(initialTable.status)
      } else {
        setBuyIn(initialBuyIn || (buyIns.length > 0 ? buyIns[0] : ''))
        setMaxSeats(9)
        setStatus('open')
      }
      setError('')
      submittingRef.current = false
    }
  }, [isOpen, mode, initialTable, initialBuyIn, buyIns])

  const validateForm = (): string | null => {
    if (!buyIn) {
      return '買入金額を選択してください'
    }

    if (maxSeats < 2 || maxSeats > 10) {
      return '最大席数は2〜10の範囲で設定してください'
    }

    return null
  }

  const handleSubmit = async () => {
    if (submittingRef.current) return
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      submittingRef.current = true
      setLoading(true)
      setError('')
      await onSubmit({
        rate: buyIn,
        max_seats: maxSeats,
        current_players: initialTable?.current_players || 0,
        status,
      })
      // Dialog will be closed by parent component on success
    } catch (err) {
      console.error('Error submitting table:', err)
      setError(err instanceof Error ? err.message : '保存に失敗しました')
    } finally {
      submittingRef.current = false
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'add' ? '卓を追加' : '卓を編集'}
      size="small"
    >
      <div className="space-y-4">
        {/* Buy-in Selection */}
        <div>
          <label htmlFor="table-buyin" className="block text-sm font-semibold text-gray-700 mb-2">
            買入金額
          </label>
          <select
            id="table-buyin"
            value={buyIn}
            onChange={(e) => {
              setBuyIn(e.target.value)
              setError('')
            }}
            disabled={mode === 'edit'}
            className={`
              w-full px-4 py-3 text-lg border-2 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-sky-500
              ${mode === 'edit' ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
              ${error ? 'border-red-500' : 'border-gray-300'}
            `}
          >
            {buyIns.length === 0 ? (
              <option value="">買入金額がありません</option>
            ) : (
              buyIns.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))
            )}
          </select>
          {mode === 'edit' && (
            <p className="mt-1 text-xs text-gray-500">買入金額は編集できません</p>
          )}
        </div>

        {/* Max Seats Input */}
        <div>
          <label htmlFor="table-max-seats" className="block text-sm font-semibold text-gray-700 mb-2">
            最大席数
          </label>
          <input
            id="table-max-seats"
            type="number"
            min="2"
            max="10"
            value={maxSeats}
            onChange={(e) => {
              setMaxSeats(parseInt(e.target.value, 10))
              setError('')
            }}
            onKeyDown={handleKeyDown}
            className={`
              w-full px-4 py-3 text-lg border-2 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-sky-500
              ${error ? 'border-red-500' : 'border-gray-300'}
            `}
            aria-invalid={!!error}
            aria-describedby={error ? 'table-error' : undefined}
          />
          <p className="mt-1 text-xs text-gray-500">2〜10席の範囲で設定してください</p>
        </div>

        {/* Status Toggle */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">ステータス</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStatus('open')}
              className={`
                flex-1 py-3 px-4 rounded-lg font-semibold text-lg transition-all
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500
                ${
                  status === 'open'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }
              `}
            >
              Open
            </button>
            <button
              type="button"
              onClick={() => setStatus('closed')}
              className={`
                flex-1 py-3 px-4 rounded-lg font-semibold text-lg transition-all
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500
                ${
                  status === 'closed'
                    ? 'bg-gray-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }
              `}
            >
              Closed
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <p id="table-error" className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

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
            loading={loading}
          >
            {mode === 'add' ? '追加' : '更新'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
