import type { ContactPayload } from '../../../services/api/contacts/contacts.api'

const NAME_REGEX = /^[a-zA-Z][a-zA-Z\s'-]{1,49}$/
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const PHONE_REGEX = /^\d{10}$/

export const validateContactForm = (
  formData: ContactPayload,
): Partial<Record<keyof ContactPayload, string>> => {
  const errors: Partial<Record<keyof ContactPayload, string>> = {}

  const firstName = formData.firstName.trim()
  const lastName = formData.lastName.trim()
  const email = formData.email?.trim() || ''
  const phone = (formData.phone || '').replace(/\D/g, '')

  if (!firstName) {
    errors.firstName = 'First name is required'
  } else if (!NAME_REGEX.test(firstName)) {
    errors.firstName = 'Enter a valid first name (letters only, min 2 characters)'
  }

  if (!lastName) {
    errors.lastName = 'Last name is required'
  } else if (!NAME_REGEX.test(lastName)) {
    errors.lastName = 'Enter a valid last name (letters only, min 2 characters)'
  }

  if (!email) {
    errors.email = 'Email is required'
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = 'Enter a valid email address'
  }

  if (!phone) {
    errors.phone = 'Phone number is required'
  } else if (!PHONE_REGEX.test(phone)) {
    errors.phone = 'Phone number must be exactly 10 digits'
  }

  if (!formData.status) {
    errors.status = 'Status is required'
  }

  return errors
}
