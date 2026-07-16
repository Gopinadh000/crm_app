import React, { useState } from 'react'
import { Visibility, VisibilityOff } from '@mui/icons-material'

type InputFieldProps = {
  label: string
  type: string
  placeholder: string
  error?: string
  name: string
  value?: string
  required?: boolean
  maxLength?: number
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  autoComplete?: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const InputField = ({
  name,
  label,
  type,
  placeholder,
  error,
  value,
  required,
  maxLength,
  inputMode,
  autoComplete,
  onChange,
}: InputFieldProps) => {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div className="flex w-full flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={inputType}
          value={value}
          placeholder={placeholder}
          maxLength={maxLength}
          inputMode={inputMode}
          onChange={onChange}
          autoComplete={
            autoComplete ?? (isPassword ? 'current-password' : undefined)
          }
          className={`h-9 w-full rounded-md border bg-white px-3 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400
            focus:border-blue-500 focus:ring-2 focus:ring-blue-100
            ${isPassword ? 'pr-10' : ''}
            ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-300 hover:border-gray-400'}
          `}
        />
        {isPassword ? (
          <button
            type="button"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            {showPassword ? (
              <VisibilityOff sx={{ fontSize: 18 }} />
            ) : (
              <Visibility sx={{ fontSize: 18 }} />
            )}
          </button>
        ) : null}
      </div>
      {error ? <span className="text-xs text-red-500">{error}</span> : null}
    </div>
  )
}

export default InputField
