import { useEffect, useState } from 'react'
import {
  CancelOutlined,
  PersonAddAltOutlined,
  SaveOutlined,
} from '@mui/icons-material'
import PageTitle from '../../components/common/page-title/PageTitle'
import Button from '../../components/common/button/Button'
import Modal from '../../components/common/modal/Modal'
import ContactForm from './components/ContactForm'
import ContactsTable from './components/ContactsTable'
import { useAuth } from '../../services/context/AuthContext'
import {
  createContact,
  deleteContact,
  fetchContacts,
  updateContact,
  type Contact,
  type ContactPayload,
  type ContactStatus,
  type ContactsPagination,
} from '../../services/api/contacts/contacts.api'
import { validateContactForm } from './utils/validateContactForm'

const PAGE_SIZE = 10

const emptyForm: ContactPayload = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  companyName: '',
  jobTitle: '',
  status: 'Lead',
  notes: '',
}

const emptyPagination: ContactsPagination = {
  page: 1,
  limit: PAGE_SIZE,
  total: 0,
  totalPages: 1,
}

const ContactsPage = () => {
  const { isAdmin } = useAuth()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [pagination, setPagination] =
    useState<ContactsPagination>(emptyPagination)
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ContactStatus | ''>('')
  const [reloadToken, setReloadToken] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null)
  const [formData, setFormData] = useState<ContactPayload>(emptyForm)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [removeImage, setRemoveImage] = useState(false)
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof ContactPayload, string>>
  >({})
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const nextSearch = searchInput.trim()
      setDebouncedSearch((prev) => {
        if (prev !== nextSearch) {
          setPage(1)
        }
        return nextSearch
      })
    }, 350)

    return () => window.clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    let cancelled = false

    const loadContacts = async () => {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const data = await fetchContacts({
          page,
          limit: PAGE_SIZE,
          search: debouncedSearch,
          status: statusFilter,
        })

        if (cancelled) return

        setContacts(data.contacts)
        setPagination(data.pagination)

        if (data.pagination.page !== page) {
          setPage(data.pagination.page)
        }
      } catch (err: unknown) {
        if (cancelled) return
        const message =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || 'Unable to load contacts'
        setErrorMessage(message)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void loadContacts()

    return () => {
      cancelled = true
    }
  }, [page, debouncedSearch, statusFilter, reloadToken])

  const handleStatusFilterChange = (value: ContactStatus | '') => {
    setStatusFilter(value)
    setPage(1)
  }
  const refreshList = () => setReloadToken((token) => token + 1)

  const resetImageState = () => {
    setImageFile(null)
    setRemoveImage(false)
  }

  const openCreateModal = () => {
    if (!isAdmin) return
    setEditingContact(null)
    setFormData(emptyForm)
    setFormErrors({})
    resetImageState()
    setFormOpen(true)
  }

  const openEditModal = (contact: Contact) => {
    if (!isAdmin) return
    setEditingContact(contact)
    setFormData({
      firstName: contact.firstName || '',
      lastName: contact.lastName || '',
      email: contact.email || '',
      phone: contact.phone || '',
      companyName: contact.companyName || '',
      jobTitle: contact.jobTitle || '',
      status: contact.status || 'Lead',
      notes: contact.notes || '',
    })
    setFormErrors({})
    resetImageState()
    setFormOpen(true)
  }

  const closeFormModal = () => {
    setFormOpen(false)
    setEditingContact(null)
    setFormData(emptyForm)
    setFormErrors({})
    resetImageState()
  }

  const openDeleteModal = (contact: Contact) => {
    if (!isAdmin) return
    setContactToDelete(contact)
    setDeleteOpen(true)
  }

  const closeDeleteModal = () => {
    setDeleteOpen(false)
    setContactToDelete(null)
  }

  const validateForm = () => {
    const nextErrors = validateContactForm(formData)

    if (imageFile && imageFile.size > 2 * 1024 * 1024) {
      setErrorMessage('Image must be 2MB or smaller')
      return false
    }

    setFormErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setIsSaving(true)
    setErrorMessage('')

    const payload: ContactPayload = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email?.trim() || undefined,
      phone: formData.phone?.replace(/\D/g, '') || undefined,
      companyName: formData.companyName?.trim() || undefined,
      jobTitle: formData.jobTitle?.trim() || undefined,
      status: formData.status || 'Lead',
      notes: formData.notes?.trim() || undefined,
    }

    const imageOptions = {
      imageFile,
      removeImage: !imageFile && removeImage,
    }

    try {
      if (editingContact) {
        await updateContact(editingContact.id, payload, imageOptions)
        closeFormModal()
        refreshList()
      } else {
        await createContact(payload, imageOptions)
        closeFormModal()
        if (page === 1) {
          refreshList()
        } else {
          setPage(1)
        }
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Unable to save contact'
      setErrorMessage(message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!contactToDelete) return

    setIsDeleting(true)
    setErrorMessage('')

    try {
      await deleteContact(contactToDelete.id)
      closeDeleteModal()

      if (contacts.length <= 1 && page > 1) {
        setPage((prev) => prev - 1)
      } else {
        refreshList()
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Unable to delete contact'
      setErrorMessage(message)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex min-h-0 flex-col gap-3 tablet:gap-4 desktop:h-full">
      <PageTitle title="Contacts">
        {isAdmin ? (
          <Button
            label="Create"
            variant="contained"
            size="md"
            startIcon={<PersonAddAltOutlined fontSize="small" />}
            onClick={openCreateModal}
          />
        ) : null}
      </PageTitle>

      {errorMessage ? (
        <div className="shrink-0 rounded-sm bg-app-error-soft px-3 py-2.5 text-sm text-app-error tablet:px-4 tablet:py-3">
          {errorMessage}
        </div>
      ) : null}

      <ContactsTable
        contacts={contacts}
        isLoading={isLoading}
        search={searchInput}
        onSearchChange={setSearchInput}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        pagination={pagination}
        onPageChange={setPage}
        canManage={isAdmin}
        onEdit={openEditModal}
        onDelete={openDeleteModal}
      />

      <Modal
        open={formOpen}
        onClose={closeFormModal}
        title={editingContact ? 'Edit Contact' : 'Create Contact'}
        variant="side"
        size="xl"
        footer={
          <div className="flex flex-col-reverse gap-1.5 mobile:flex-row mobile:items-center mobile:justify-end [&_button]:w-full mobile:[&_button]:w-auto">
            <Button
              label="Cancel"
              variant="outlined"
              size="sm"
              onClick={closeFormModal}
              disabled={isSaving}
              startIcon={<CancelOutlined fontSize="small" />}
            />
            <Button
              label={
                isSaving
                  ? 'Saving...'
                  : editingContact
                    ? 'Save Changes'
                    : 'Create'
              }
              startIcon={<SaveOutlined fontSize="small" />}
              variant="contained"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
            />
          </div>
        }
      >
        <ContactForm
          value={formData}
          onChange={setFormData}
          errors={formErrors}
          existingImage={editingContact?.image}
          imageFile={imageFile}
          onImageFileChange={setImageFile}
          removeImage={removeImage}
          onRemoveImageChange={setRemoveImage}
        />
      </Modal>

      <Modal
        open={deleteOpen}
        onClose={closeDeleteModal}
        title="Delete Contact"
        variant="center"
        size="sm"
        footer={
          <div className="flex flex-col-reverse gap-2 mobile:flex-row mobile:items-center mobile:justify-end [&_button]:w-full mobile:[&_button]:w-auto">
            <Button
              label="Cancel"
              variant="outlined"
              size="md"
              onClick={closeDeleteModal}
              disabled={isDeleting}
            />
            <Button
              label={isDeleting ? 'Deleting...' : 'Delete'}
              variant="contained"
              size="md"
              onClick={handleDelete}
              disabled={isDeleting}
            />
          </div>
        }
      >
        <p className="text-sm text-app-text-secondary">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-app-text">
            {contactToDelete
              ? `${contactToDelete.firstName} ${contactToDelete.lastName}`
              : 'this contact'}
          </span>
          ? This action cannot be undone.
        </p>
      </Modal>
    </div>
  )
}

export default ContactsPage
