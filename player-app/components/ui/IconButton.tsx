import { ButtonHTMLAttributes, ReactNode } from 'react'

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'primary' | 'danger'
}

const sizeStyles = {
  sm: 'w-9 h-9',
  md: 'w-11 h-11',
  lg: 'w-14 h-14'
}

const variantStyles = {
  default: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  danger: 'bg-red-600 hover:bg-red-700 text-white'
}

export function IconButton({
  icon,
  size = 'md',
  variant = 'default',
  className = '',
  'aria-label': ariaLabel,
  ...props
}: IconButtonProps) {
  if (!ariaLabel) {
    console.warn('IconButton: aria-label is required for accessibility')
  }

  return (
    <button
      className={`
        ${sizeStyles[size]} ${variantStyles[variant]}
        rounded-full flex items-center justify-center
        transition-all duration-200 active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${className}
      `}
      aria-label={ariaLabel}
      {...props}
    >
      {icon}
    </button>
  )
}
