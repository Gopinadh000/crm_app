import React, { useEffect, useRef, useState } from 'react'
import { PhotoCameraOutlined, DeleteOutlineOutlined } from '@mui/icons-material'
import type { SelectChangeEvent } from '@mui/material'
import InputField from '../../../components/form-fields/input-field/InputField'
import SelectField from '../../../components/form-fields/select-field/SelectField'
import ContactAvatar from './ContactAvatar'
import {
  CONTACT_STATUSES,
  type ContactPayload,
} from '../../../services/api/contacts/contacts.api'

const statusOptions = CONTACT_STATUSES.map((status) => ({
  label: status,
  value: status,
}))

type ContactFormProps = {
  value: ContactPayload
  onChange: (value: ContactPayload) => void
  errors?: Partial<Record<keyof ContactPayload, string>>
  existingImage?: string | null
  imageFile?: File | null
  onImageFileChange: (file: File | null) => void
  removeImage?: boolean
  onRemoveImageChange: (remove: boolean) => void
}

const ContactForm = ({
  value,
  onChange,
  errors = {},
  existingImage = null,
  imageFile = null,
  onImageFileChange,
  removeImage = false,
  onRemoveImageChange,
}: ContactFormProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null)
      return
    }

    const objectUrl = URL.createObjectURL(imageFile)
    setPreviewUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [imageFile])

  const displayImage = previewUrl || (!removeImage ? existingImage : null)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value: next } = e.target
    const sanitized =
      name === 'phone' ? next.replace(/\D/g, '').slice(0, 10) : next
    onChange({ ...value, [name]: sanitized })
  }

  const handleStatusChange = (e: SelectChangeEvent<string>) => {
    onChange({
      ...value,
      status: e.target.value as ContactPayload['status'],
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (!file) return

    if (!file.type.startsWith('image/')) {
      return
    }

    onRemoveImageChange(false)
    onImageFileChange(file)
  }

  const handleRemoveImage = () => {
    onImageFileChange(null)
    onRemoveImageChange(true)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-start gap-2 rounded-md border border-app-border bg-app-surface-muted px-2.5 py-2 mobile:flex-row mobile:items-center mobile:gap-3 tablet:px-3">
        <ContactAvatar
          firstName={value.firstName}
          lastName={value.lastName}
          image={displayImage}
          size="md"
        />

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="text-xs font-medium text-app-text">Contact Photo</p>
          <p className="text-[11px] leading-tight text-app-text-muted">
            JPEG, PNG, WEBP, or GIF. Max 2MB.
          </p>
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1 rounded-md border border-app-primary-500 bg-app-surface px-2 py-1 text-[11px] font-medium text-app-primary-500 transition-colors hover:bg-app-primary-50"
            >
              <PhotoCameraOutlined sx={{ fontSize: 14 }} />
              {displayImage ? 'Change Photo' : 'Upload Photo'}
            </button>

            {displayImage ? (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="inline-flex items-center gap-1 rounded-md border border-app-border bg-app-surface px-2 py-1 text-[11px] font-medium text-app-text-secondary transition-colors hover:bg-app-surface-muted"
              >
                <DeleteOutlineOutlined sx={{ fontSize: 14 }} />
                Remove
              </button>
            ) : null}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 mobile:grid-cols-2">
        <InputField
          required
          name="firstName"
          label="First Name"
          type="text"
          placeholder="Enter first name"
          value={value.firstName}
          error={errors.firstName}
          onChange={handleChange}
        />
        <InputField
          required
          name="lastName"
          label="Last Name"
          type="text"
          placeholder="Enter last name"
          value={value.lastName}
          error={errors.lastName}
          onChange={handleChange}
        />
      </div>

      <InputField
        required
        name="email"
        label="Email"
        type="email"
        placeholder="Enter email"
        value={value.email || ''}
        error={errors.email}
        onChange={handleChange}
      />

      <InputField
        required
        name="phone"
        label="Phone"
        type="tel"
        inputMode="numeric"
        maxLength={10}
        placeholder="Enter 10-digit phone number"
        value={value.phone || ''}
        error={errors.phone}
        onChange={handleChange}
      />

      <InputField
        name="companyName"
        label="Company"
        type="text"
        placeholder="Enter company name"
        value={value.companyName || ''}
        onChange={handleChange}
      />

      <SelectField
        required
        name="status"
        label="Status"
        placeholder="Select status"
        value={value.status}
        options={statusOptions}
        error={errors.status}
        onChange={handleStatusChange}
      />

      <div className="flex w-full flex-col gap-1.5">
        <label htmlFor="notes" className="text-sm font-medium text-app-text-secondary">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          value={value.notes || ''}
          placeholder="Add notes"
          onChange={handleChange}
          className="w-full resize-none rounded-md border border-app-border bg-app-surface px-3 py-2 text-sm text-app-text outline-none transition-colors placeholder:text-app-text-muted hover:border-app-border-strong focus:border-app-primary-500 focus:ring-2 focus:ring-app-primary-100"
        />
      </div>
    </div>
  )
}

export default ContactForm
