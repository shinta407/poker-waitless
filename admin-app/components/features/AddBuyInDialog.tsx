'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

interface AddBuyInDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (buyIn: string) => Promise<void>
  mode: 'add' | 'edit'
  initialBuyIn?: string
  existingBuyIns: string[]
}

export function AddBuyInDialog({
  isOpen,
  onClose,
  onSubmit,
  mode,
  initialBuyIn = '',
  existingBuyIns,
}: AddBuyInDialogProps) {
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const t = useTranslations()

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialBuyIn) {
        // Extract number from NT$ format (e.g., "NT$3,400" -> "3400")
        const numericValue = initialBuyIn.replace(/[^0-9]/g, '')
        setAmount(numericValue)
      } else {
        setAmount('')
      }
      setError('')
    }
  }, [isOpen, mode, initialBuyIn])

  const formatBuyIn = (value: string): string => {
    // Remove non-digits
    const numericValue = value.replace(/[^0-9]/g, '')
    if (!numericValue) return ''

    // Add comma separator
    const number = parseInt(numericValue, 10)
    const formatted = number.toLocaleString('en-US')

    // Add NT$ prefix
    return `NT$${formatted}`
  }

  const validateBuyIn = (value: string): string | null => {
    if (!value) {
      return t('buyIn.validation.required')
    }

    const numericValue = value.replace(/[^0-9]/g, '')
    if (!numericValue) {
      return t('buyIn.validation.invalidNumber')
    }

    const number = parseInt(numericValue, 10)
    if (number <= 0) {
      return t('buyIn.validation.positive')
    }

    const formattedBuyIn = formatBuyIn(value)
    if (existingBuyIns.includes(formattedBuyIn)) {
      return t('buyIn.validation.duplicate')
    }

    return null
  }

  const handleSubmit = async () => {
    const validationError = validateBuyIn(amount)
    if (validationError) {
      setError(validationError)
      return
    }

    const formattedBuyIn = formatBuyIn(amount)

    try {
      setLoading(true)
      setError('')
      await onSubmit(formattedBuyIn)
      // Dialog will be closed by parent component on success
    } catch (err) {
      console.error('Error submitting buy-in:', err)
      setError(err instanceof Error ? err.message : '保存に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleAmountChange = (value: string) => {
    // Allow only digits
    const cleaned = value.replace(/[^0-9]/g, '')
    setAmount(cleaned)
    setError('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const previewBuyIn = amount ? formatBuyIn(amount) : ''

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'add' ? t('buyIn.add') : t('buyIn.edit')}
      size="small"
    >
      <div className="space-y-4">
        {/* Amount Input */}
        <div>
          <label htmlFor="buy-in-amount" className="block text-sm font-semibold text-gray-700 mb-2">
            {t('buyIn.amount')}
          </label>
          <input
            id="buy-in-amount"
            type="text"
            inputMode="numeric"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('buyIn.amountPlaceholder')}
            className={`
              w-full px-4 py-3 text-lg border-2 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-sky-500
              ${error ? 'border-red-500' : 'border-gray-300'}
            `}
            aria-invalid={!!error}
            aria-describedby={error ? 'buy-in-error' : 'buy-in-preview'}
            autoFocus
          />
          {error && (
            <p id="buy-in-error" className="mt-2 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
        </div>

        {/* Preview */}
        {previewBuyIn && !error && (
          <div id="buy-in-preview" className="p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">{t('buyIn.preview')}</p>
            <p className="text-2xl font-bold text-blue-600">{previewBuyIn}</p>
          </div>
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
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            size="large"
            onClick={handleSubmit}
            className="flex-1"
            loading={loading}
          >
            {mode === 'add' ? t('common.add') : t('common.update')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
