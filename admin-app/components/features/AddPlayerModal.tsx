'use client'

import React, { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

export interface AddPlayerModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (name: string, rate: string) => Promise<void>
  defaultRate?: string
  rates: string[]
}

export function AddPlayerModal({
  isOpen,
  onClose,
  onSubmit,
  defaultRate,
  rates,
}: AddPlayerModalProps) {
  const [name, setName] = useState('')
  const [rate, setRate] = useState(defaultRate || rates[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const trimmed = name.trim().slice(0, 50)
    // Strip control characters
    const sanitized = trimmed.replace(/[\x00-\x1F\x7F\u200B-\u200F\u2028-\u202F\uFEFF]/g, '')
    if (!sanitized) {
      setError('プレイヤー名を入力してください')
      return
    }
    setName(sanitized)

    setLoading(true)

    try {
      await onSubmit(sanitized, rate)
      // Reset form
      setName('')
      setRate(defaultRate || rates[0])
      onClose()
    } catch (err) {
      console.error('Error adding player:', err)
      setError('プレイヤー追加に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setName('')
      setRate(defaultRate || rates[0])
      setError('')
      onClose()
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="プレイヤー追加"
      size="medium"
      closeOnBackdropClick={!loading}
      closeOnEscape={!loading}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Input */}
        <div>
          <label
            htmlFor="player-name"
            className="block text-lg font-semibold text-gray-900 mb-2"
          >
            プレイヤー名 <span className="text-red-600">*</span>
          </label>
          <input
            id="player-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            required
            maxLength={50}
            aria-required="true"
            aria-invalid={!!error}
            aria-describedby={error ? 'name-error' : undefined}
            disabled={loading}
            className="
              w-full px-4 py-3
              text-lg
              border-2 border-gray-300 rounded-lg
              focus:outline-none focus:ring-3 focus:ring-sky-500 focus:border-sky-500
              disabled:bg-gray-100 disabled:cursor-not-allowed
              transition-colors
            "
            placeholder="例: 山田太郎"
          />
          {error && (
            <p id="name-error" className="mt-2 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
        </div>

        {/* Rate Selection */}
        <div>
          <label className="block text-lg font-semibold text-gray-900 mb-3">
            レート <span className="text-red-600">*</span>
          </label>
          <div
            role="radiogroup"
            aria-label="レート選択"
            className="grid grid-cols-2 gap-3"
          >
            {rates.map((r) => (
              <button
                key={r}
                type="button"
                role="radio"
                aria-checked={rate === r}
                onClick={() => setRate(r)}
                disabled={loading}
                className={`
                  px-4 py-3
                  text-base font-semibold
                  rounded-lg border-2
                  transition-all
                  focus:outline-none focus:ring-3 focus:ring-sky-500
                  disabled:cursor-not-allowed disabled:opacity-50
                  ${
                    rate === r
                      ? 'bg-sky-500 text-white border-sky-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-sky-300 hover:bg-sky-50'
                  }
                `}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="ghost"
            size="large"
            onClick={handleClose}
            disabled={loading}
            className="flex-1"
          >
            キャンセル
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="large"
            icon={<UserPlus className="w-5 h-5" />}
            loading={loading}
            className="flex-1"
          >
            追加
          </Button>
        </div>
      </form>
    </Modal>
  )
}
