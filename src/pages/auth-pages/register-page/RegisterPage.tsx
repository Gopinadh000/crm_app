import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PersonAddAltOutlined } from '@mui/icons-material'
import type { SelectChangeEvent } from '@mui/material'
import InputField from '../../../components/form-fields/input-field/InputField'
import SelectField from '../../../components/form-fields/select-field/SelectField'
import Button from '../../../components/common/button/Button'
import crmlogo from '../../../assets/crm-logo.png'
import { apiInstance } from '../../../services/api/axios-setup/axiosInstance'

const roleOptions = [
  { label: 'Admin', value: 'ADMIN' },
  { label: 'User', value: 'USER' },
]

const RegisterPage = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'USER',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement> | SelectChangeEvent<string>,
  ) => {
    const { name, value } = e.target
    if (!name) return
    setFormData({ ...formData, [name]: value })
    if (error) setError('')
  }

  const handleSubmit = async () => {
    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.email.trim() ||
      !formData.password ||
      !formData.role
    ) {
      setError('All fields are required')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await apiInstance.post('/v1/auth/register', {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
      })
      navigate('/login', { replace: true })
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Unable to register. Please try again.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex h-full overflow-y-hidden flex-col items-center justify-center bg-app-surface p-4 mobile:p-6 tablet:flex-row tablet:items-stretch tablet:gap-6 tablet:p-8 desktop:gap-10 desktop:p-12 xl:p-16">
      <div className="hidden w-full items-center justify-center tablet:flex tablet:w-1/2">
        <img
          src={crmlogo}
          alt="MiniCRM"
          className="h-auto w-full max-w-sm object-contain desktop:max-w-md xl:max-w-lg"
        />
      </div>

      <div className="my-auto w-full max-w-md overflow-y-auto rounded-md border border-app-border bg-app-surface p-5 mobile:p-6 sm:p-8 tablet:w-1/2 tablet:max-h-[90vh] tablet:max-w-none tablet:px-8 tablet:py-10 desktop:px-12 desktop:py-12 xl:px-16 xl:py-14">
        <div className="mb-4 flex justify-center tablet:hidden">
          <img
            src={crmlogo}
            alt="MiniCRM"
            className="h-14 w-auto object-contain mobile:h-16"
          />
        </div>

        <div className="mb-4 flex flex-col gap-2">
          <h2 className="text-xl font-bold text-app-primary-500 mobile:text-2xl">
            Create your account
          </h2>
          <p className="text-xs text-app-text-muted mobile:text-sm">
            Enter your details to register a new account
          </p>
        </div>

        <div className="flex flex-col gap-3 mobile:gap-4">
          <div className="grid grid-cols-1 gap-3 mobile:grid-cols-2 mobile:gap-4">
            <InputField
              required
              name="firstName"
              label="First Name"
              type="text"
              placeholder="Enter first name"
              value={formData.firstName}
              onChange={handleChange}
            />
            <InputField
              required
              name="lastName"
              label="Last Name"
              type="text"
              placeholder="Enter last name"
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>

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

          <SelectField
            required
            name="role"
            label="Role"
            placeholder="Select role"
            value={formData.role}
            options={roleOptions}
            onChange={handleChange}
          />

          {error ? (
            <p className="rounded-md bg-app-error-soft px-3 py-2 text-xs text-app-error">
              {error}
            </p>
          ) : null}

          <Button
            label={isSubmitting ? 'Registering...' : 'Register'}
            onClick={handleSubmit}
            startIcon={<PersonAddAltOutlined fontSize="small" />}
            variant="contained"
            size="md"
            disabled={isSubmitting}
          />

          <p className="text-xs text-app-text-muted">
            Already have an account?{' '}
            <Link
              to="/login"
              className="ml-1 font-bold text-app-primary-500 hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
