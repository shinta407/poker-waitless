import React from 'react'

export type BadgeVariant = 'waiting' | 'called' | 'seated' | 'neutral'

export interface BadgeProps {
  variant?: BadgeVariant
  icon?: React.ReactNode
  children: React.ReactNode
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  waiting: 'bg-gray-100 text-gray-700 border-gray-300',
  called: 'bg-amber-100 text-amber-900 border-amber-300',
  seated: 'bg-green-100 text-green-900 border-green-300',
  neutral: 'bg-gray-100 text-gray-600 border-gray-200',
}

export function Badge({
  variant = 'neutral',
  icon,
  children,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-2
        px-3 py-1.5
        text-sm font-semibold
        rounded-lg border-2
        ${variantStyles[variant]}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      <span>{children}</span>
    </span>
  )
}
