'use client'

import React from 'react'
import { useToastStore } from '@/hooks/useToast'
import { Toast } from './Toast'

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  // Limit to 3 visible toasts
  const visibleToasts = toasts.slice(0, 3)

  return (
    <div
      className="fixed top-4 right-4 z-[100] flex flex-col gap-3"
      aria-live="polite"
      aria-atomic="true"
    >
      {visibleToasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          type={toast.type}
          message={toast.message}
          onClose={removeToast}
        />
      ))}
    </div>
  )
}
