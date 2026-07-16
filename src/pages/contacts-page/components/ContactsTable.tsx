import { DeleteOutlineRounded, EditOutlined, Search } from '@mui/icons-material'
import ThreeDotsMenu from '../../../components/common/three-dots-menu/ThreeDotsMenu'
import type {
  Contact,
  ContactStatus,
  ContactsPagination,
} from '../../../services/api/contacts/contacts.api'
import { CONTACT_STATUSES } from '../../../services/api/contacts/contacts.api'
import ContactAvatar from './ContactAvatar'

type ContactsTableProps = {
  contacts: Contact[]
  isLoading?: boolean
  search: string
  onSearchChange: (value: string) => void
  statusFilter: ContactStatus | ''
  onStatusFilterChange: (value: ContactStatus | '') => void
  pagination: ContactsPagination
  onPageChange: (page: number) => void
  canManage?: boolean
  onEdit: (contact: Contact) => void
  onDelete: (contact: Contact) => void
}

const statusBadgeClass: Record<ContactStatus, string> = {
  Lead: 'bg-amber-50 text-amber-700',
  Prospect: 'bg-blue-50 text-blue-700',
  Customer: 'bg-emerald-50 text-emerald-700',
}

const ContactsTable = ({
  contacts,
  isLoading = false,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  pagination,
  onPageChange,
  canManage = false,
  onEdit,
  onDelete,
}: ContactsTableProps) => {
  const { page, limit, total, totalPages } = pagination
  const from = total === 0 ? 0 : (page - 1) * limit + 1
  const to = Math.min(page * limit, total)
  const hasFilters = Boolean(search.trim() || statusFilter)

  return (
    <div className="flex flex-col rounded-sm bg-white desktop:min-h-0 desktop:flex-1 desktop:overflow-hidden">
      <div className="flex shrink-0 flex-col gap-3 border-b border-gray-100 px-3 py-3 tablet:px-4 desktop:flex-row desktop:items-center desktop:justify-end">
        <div className="flex w-full flex-col gap-3 mobile:flex-row mobile:items-center mobile:justify-end">
          <div className="relative w-full mobile:w-auto mobile:min-w-[14rem] mobile:max-w-sm mobile:flex-1 desktop:flex-none desktop:w-72">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              sx={{ fontSize: 18 }}
            />
            <input
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by name or email"
              className="h-9 w-full rounded-md border border-gray-300 bg-white pl-9 pr-3 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) =>
              onStatusFilterChange(e.target.value as ContactStatus | '')
            }
            className="h-9 w-full shrink-0 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none transition-colors hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 mobile:w-auto"
          >
            <option value="">All statuses</option>
            {CONTACT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="desktop:min-h-0 desktop:flex-1 desktop:overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center p-6 text-center text-sm text-gray-500 tablet:p-8 desktop:h-full">
            Loading contacts...
          </div>
        ) : contacts.length === 0 ? (
          <div className="flex items-center justify-center p-6 text-center text-sm text-gray-500 tablet:p-8 desktop:h-full">
            {hasFilters
              ? 'No contacts match your search or filter.'
              : canManage
                ? 'No contacts yet. Click Create to add your first contact.'
                : 'No contacts yet.'}
          </div>
        ) : (
          <>
            {/* Mobile card list */}
            <div className="divide-y divide-gray-100 tablet:hidden">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-start gap-3 px-3 py-3"
                >
                  <ContactAvatar
                    firstName={contact.firstName}
                    lastName={contact.lastName}
                    image={contact.image}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-gray-900">
                          {contact.firstName} {contact.lastName}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-gray-500">
                          {contact.email || 'No email'}
                        </p>
                      </div>
                      {canManage ? (
                        <ThreeDotsMenu
                          ariaLabel={`Actions for ${contact.firstName} ${contact.lastName}`}
                          items={[
                            {
                              label: 'Edit Contact',
                              icon: EditOutlined,
                              onClick: () => onEdit(contact),
                            },
                            {
                              label: 'Delete Contact',
                              icon: DeleteOutlineRounded,
                              danger: true,
                              onClick: () => onDelete(contact),
                            },
                          ]}
                        />
                      ) : null}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex rounded px-2 py-0.5 text-[11px] font-semibold ${
                          statusBadgeClass[contact.status] ||
                          'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {contact.status}
                      </span>
                      {contact.companyName ? (
                        <span className="truncate text-xs text-gray-500">
                          {contact.companyName}
                        </span>
                      ) : null}
                      {contact.phone ? (
                        <span className="truncate text-xs text-gray-500">
                          {contact.phone}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tablet+ table */}
            <div className="hidden min-w-0 overflow-x-auto tablet:block">
              <table className="min-w-[640px] w-full border-collapse text-left text-sm desktop:min-w-full">
                <thead className="sticky top-0 z-10 bg-gray-50">
                  <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th className="bg-gray-50 px-4 py-3">Name</th>
                    <th className="bg-gray-50 px-4 py-3">Email</th>
                    <th className="hidden bg-gray-50 px-4 py-3 desktop:table-cell">
                      Phone
                    </th>
                    <th className="bg-gray-50 px-4 py-3">Company</th>
                    <th className="bg-gray-50 px-4 py-3">Status</th>
                    {canManage ? (
                      <th className="bg-gray-50 px-4 py-3 text-right">
                        Actions
                      </th>
                    ) : null}
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((contact) => (
                    <tr
                      key={contact.id}
                      className="border-b border-gray-50 transition-colors hover:bg-gray-50/80"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <ContactAvatar
                            firstName={contact.firstName}
                            lastName={contact.lastName}
                            image={contact.image}
                            size="sm"
                          />
                          <span className="font-medium text-gray-900">
                            {contact.firstName} {contact.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="max-w-[12rem] truncate px-4 py-3 text-gray-600 xl:max-w-none">
                        {contact.email || '—'}
                      </td>
                      <td className="hidden px-4 py-3 text-gray-600 desktop:table-cell">
                        {contact.phone || '—'}
                      </td>
                      <td className="max-w-[10rem] truncate px-4 py-3 text-gray-600 desktop:max-w-none">
                        {contact.companyName || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded px-2 py-0.5 text-[11px] font-semibold ${
                            statusBadgeClass[contact.status] ||
                            'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {contact.status}
                        </span>
                      </td>
                      {canManage ? (
                        <td className="px-4 py-3">
                          <div className="flex justify-end">
                            <ThreeDotsMenu
                              ariaLabel={`Actions for ${contact.firstName} ${contact.lastName}`}
                              items={[
                                {
                                  label: 'Edit Contact',
                                  icon: EditOutlined,
                                  onClick: () => onEdit(contact),
                                },
                                {
                                  label: 'Delete Contact',
                                  icon: DeleteOutlineRounded,
                                  danger: true,
                                  onClick: () => onDelete(contact),
                                },
                              ]}
                            />
                          </div>
                        </td>
                      ) : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <div className="flex shrink-0 flex-col gap-3 border-t border-gray-100 px-3 py-3 mobile:flex-row mobile:items-center mobile:justify-between tablet:px-4">
        <p className="text-xs text-gray-500">
          {total === 0
            ? 'No contacts'
            : `Showing ${from}-${to} of ${total} · Page ${page} of ${totalPages} · 10 / page`}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1 || isLoading}
            onClick={() => onPageChange(page - 1)}
            className="h-8 flex-1 rounded-md border border-gray-300 px-3 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 mobile:flex-none"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={page >= totalPages || isLoading || total === 0}
            onClick={() => onPageChange(page + 1)}
            className="h-8 flex-1 rounded-md border border-gray-300 px-3 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 mobile:flex-none"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

export default ContactsTable
