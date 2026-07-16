import { apiInstance } from '../axios-setup/axiosInstance'

export const CONTACT_STATUSES = ['Lead', 'Prospect', 'Customer'] as const

export type ContactStatus = (typeof CONTACT_STATUSES)[number]

export type Contact = {
  id: number
  userId: number
  firstName: string
  lastName: string
  email?: string | null
  phone?: string | null
  companyName?: string | null
  jobTitle?: string | null
  status: ContactStatus
  notes?: string | null
  hasImage?: boolean
  image?: string | null
  createdAt?: string
  updatedAt?: string
}

export type ContactPayload = {
  firstName: string
  lastName: string
  email?: string
  phone?: string
  companyName?: string
  jobTitle?: string
  status: ContactStatus
  notes?: string
}

export type ContactSaveOptions = {
  imageFile?: File | null
  removeImage?: boolean
}

export type ContactsPagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type ContactsListResponse = {
  contacts: Contact[]
  pagination: ContactsPagination
}

export type FetchContactsParams = {
  page?: number
  limit?: number
  search?: string
  status?: ContactStatus | ''
}

const appendContactFields = (
  formData: FormData,
  payload: ContactPayload,
  options?: ContactSaveOptions,
) => {
  formData.append('firstName', payload.firstName)
  formData.append('lastName', payload.lastName)
  formData.append('email', payload.email || '')
  formData.append('phone', payload.phone || '')
  formData.append('companyName', payload.companyName || '')
  formData.append('jobTitle', payload.jobTitle || '')
  formData.append('status', payload.status || 'Lead')
  formData.append('notes', payload.notes || '')

  if (options?.removeImage) {
    formData.append('removeImage', 'true')
  }

  if (options?.imageFile) {
    formData.append('image', options.imageFile)
  }
}

export const fetchContacts = async (
  params: FetchContactsParams = {},
): Promise<ContactsListResponse> => {
  const { data } = await apiInstance.get('/v1/contacts', {
    params: {
      page: params.page ?? 1,
      limit: 10,
      search: params.search?.trim() || undefined,
      status: params.status || undefined,
    },
  })

  return data.data as ContactsListResponse
}

export const createContact = async (
  payload: ContactPayload,
  options?: ContactSaveOptions,
) => {
  const formData = new FormData()
  appendContactFields(formData, payload, options)

  const { data } = await apiInstance.post('/v1/contact', formData)
  return data.data as Contact
}

export const updateContact = async (
  id: number,
  payload: ContactPayload,
  options?: ContactSaveOptions,
) => {
  const formData = new FormData()
  appendContactFields(formData, payload, options)

  const { data } = await apiInstance.put(`/v1/contact/${id}`, formData)
  return data.data as Contact
}

export const deleteContact = async (id: number) => {
  const { data } = await apiInstance.delete(`/v1/contact/${id}`)
  return data.data as { id: number }
}
