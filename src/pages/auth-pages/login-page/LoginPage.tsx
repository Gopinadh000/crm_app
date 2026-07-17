import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { VerifiedUserOutlined } from '@mui/icons-material'
import InputField from '../../../components/form-fields/input-field/InputField'
import Button from '../../../components/common/button/Button'
import crmlogo from '../../../assets/crm-logo.png'
import { useAuth } from '../../../services/context/AuthContext'

const LoginPage = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (error) setError('')
  }

  const handleSubmit = async () => {
    if (!formData.email.trim() || !formData.password) {
      setError('Email and password are required')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await login(formData.email.trim(), formData.password)
      navigate('/', { replace: true })
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Unable to login. Please try again.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-app-surface p-4 mobile:p-6 tablet:flex-row tablet:gap-6 tablet:p-8 desktop:gap-10 desktop:p-12 xl:p-16">
      <div className="hidden w-full items-center justify-center tablet:flex tablet:w-1/2">
        <img
          src={crmlogo}
          alt="MiniCRM"
          className="h-auto w-full max-w-sm object-contain desktop:max-w-md xl:max-w-lg"
        />
      </div>

      <div className="w-full max-w-md rounded-md border border-app-border bg-app-surface p-5 mobile:p-6 sm:p-8 tablet:w-1/2 tablet:max-w-none tablet:px-8 tablet:py-12 desktop:px-14 desktop:py-16 xl:px-20 xl:py-20">
        <div className="mb-5 flex justify-center tablet:hidden">
          <img
            src={crmlogo}
            alt="MiniCRM"
            className="h-14 w-auto object-contain mobile:h-16"
          />
        </div>

        <div className="mb-5 flex flex-col gap-2">
          <h2 className="text-xl font-bold text-app-primary-500 mobile:text-2xl">
            Login to your account
          </h2>
          <p className="text-xs text-app-text-muted mobile:text-sm">
            Enter your email and password to login to your account
          </p>
        </div>

        <div className="flex flex-col gap-4 mobile:gap-5">
          <InputField
            required
            name="email"
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
          />
          <InputField
            required
            name="password"
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
          />

          {error ? (
            <p className="rounded-md bg-app-error-soft px-3 py-2 text-xs text-app-error">
              {error}
            </p>
          ) : null}

          <Button
            label={isSubmitting ? 'Logging in...' : 'Login'}
            onClick={handleSubmit}
            startIcon={<VerifiedUserOutlined />}
            variant="contained"
            size="md"
            disabled={isSubmitting}
          />
          <p className="text-xs text-app-text-muted">
            Don&apos;t have an account?{' '}
            <Link
              to="/register"
              className="ml-1 font-bold text-app-primary-500 hover:underline"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
