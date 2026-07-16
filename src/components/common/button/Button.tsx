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
    'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-100 disabled:bg-blue-300',
  outlined:
    'border border-blue-600 bg-white text-blue-600 hover:bg-blue-50 focus:ring-blue-100 disabled:border-blue-200 disabled:text-blue-300',
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
