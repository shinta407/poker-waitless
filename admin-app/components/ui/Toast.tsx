'use client'

import React, { useEffect } from 'react'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastProps {
  id: string
  type: ToastType
  message: string
  onClose: (id: string) => void
  duration?: number
}

const typeConfig = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-500',
    textColor: 'text-green-900',
    iconColor: 'text-green-600',
  },
  error: {
    icon: AlertCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-500',
    textColor: 'text-red-900',
    iconColor: 'text-red-600',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-900',
    iconColor: 'text-blue-600',
  },
}

export function Toast({ id, type, message, onClose, duration = 4000 }: ToastProps) {
  const config = typeConfig[type]
  const Icon = config.icon

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id)
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [id, duration, onClose])

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`
        flex items-center gap-3
        px-4 py-3 rounded-lg
        border-l-4 ${config.borderColor}
        ${config.bgColor} ${config.textColor}
        shadow-lg
        min-w-[300px] max-w-[500px]
        animate-slide-in-right
      `}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 ${config.iconColor}`} aria-hidden="true" />
      <p className="flex-1 font-medium">{message}</p>
      <button
        onClick={() => onClose(id)}
        className="
          p-1 rounded
          hover:bg-black/10
          transition-colors
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500
        "
        aria-label="閉じる"
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  )
}
