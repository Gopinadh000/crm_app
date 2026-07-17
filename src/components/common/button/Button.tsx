import React from 'react'

type ButtonProps = {
  label: string
  onClick?: () => void
  startIcon?: React.ReactNode
  variant?: 'contained' | 'outlined'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const sizeClasses = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-9 px-4 text-sm gap-2',
  lg: 'h-10 px-5 text-sm gap-2',
} as const

const variantClasses = {
  contained:
    'bg-app-primary-500 text-app-text-inverse hover:bg-app-primary-800 focus:ring-app-primary-100 disabled:bg-app-primary-100 disabled:text-app-primary-800',
  outlined:
    'border border-app-primary-500 bg-app-surface text-app-primary-500 hover:bg-app-primary-50 focus:ring-app-primary-100 disabled:border-app-primary-100 disabled:text-app-primary-100',
} as const

const Button = ({
  label,
  onClick,
  startIcon,
  variant = 'contained',
  size = 'md',
  disabled = false,
  type = 'button',
}: ButtonProps) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex cursor-pointer items-center justify-center rounded-md font-medium outline-none transition-colors focus:ring-2 disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${variantClasses[variant]}
      `}
    >
      {startIcon ? <span className="inline-flex shrink-0">{startIcon}</span> : null}
      <span>{label}</span>
    </button>
  )
}

export default Button
