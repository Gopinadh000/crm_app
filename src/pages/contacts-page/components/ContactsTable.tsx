import {
  DeleteOutlineRounded,
  DownloadOutlined,
  EditOutlined,
  Search,
} from '@mui/icons-material'
import ThreeDotsMenu from '../../../components/common/three-dots-menu/ThreeDotsMenu'
import Button from '../../../components/common/button/Button'
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
  isExporting?: boolean
  search: string
  onSearchChange: (value: string) => void
  statusFilter: ContactStatus | ''
  onStatusFilterChange: (value: ContactStatus | '') => void
  pagination: ContactsPagination
  onPageChange: (page: number) => void
  onExportCsv?: () => void
  canManage?: boolean
  onEdit: (contact: Contact) => void
  onDelete: (contact: Contact) => void
}

const statusBadgeClass: Record<ContactStatus, string> = {
  Lead: 'bg-app-warning-soft text-app-warning',
  Prospect: 'bg-app-primary-50 text-app-primary-800',
  Customer: 'bg-app-success-soft text-app-success',
}

const ContactsTable = ({
  contacts,
  isLoading = false,
  isExporting = false,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  pagination,
  onPageChange,
  onExportCsv,
  canManage = false,
  onEdit,
  onDelete,
}: ContactsTableProps) => {
  const { page, limit, total, totalPages } = pagination
  const from = total === 0 ? 0 : (page - 1) * limit + 1
  const to = Math.min(page * limit, total)
  const hasFilters = Boolean(search.trim() || statusFilter)

  return (
    <div className="flex flex-col rounded-sm bg-app-surface desktop:min-h-0 desktop:flex-1 desktop:overflow-hidden">
      <div className="flex shrink-0 flex-col gap-3 border-b border-app-border px-3 py-3 tablet:px-4 desktop:flex-row desktop:items-center desktop:justify-end">
        <div className="flex w-full flex-col gap-3 mobile:flex-row mobile:items-center mobile:justify-end">
          <div className="relative w-full mobile:w-auto mobile:min-w-[14rem] mobile:max-w-sm mobile:flex-1 desktop:flex-none desktop:w-72">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-app-text-muted"
              sx={{ fontSize: 18 }}
            />
            <input
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by name or email"
              className="h-9 w-full rounded-md border border-app-border bg-app-surface pl-9 pr-3 text-sm text-app-text outline-none transition-colors placeholder:text-app-text-muted hover:border-app-border-strong focus:border-app-primary-500 focus:ring-2 focus:ring-app-primary-100"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) =>
              onStatusFilterChange(e.target.value as ContactStatus | '')
            }
            className="h-9 w-full shrink-0 rounded-md border border-app-border bg-app-surface px-3 text-sm text-app-text-secondary outline-none transition-colors hover:border-app-border-strong focus:border-app-primary-500 focus:ring-2 focus:ring-app-primary-100 mobile:w-auto"
            style={{ colorScheme: 'inherit' }}
          >
            <option value="">All statuses</option>
            {CONTACT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          {onExportCsv ? (
            <Button
              label={isExporting ? 'Exporting...' : 'CSV'}
              variant="outlined"
              size="sm"
              disabled={isLoading || isExporting || total === 0}
              onClick={onExportCsv}
              startIcon={<DownloadOutlined fontSize="small" />}
            />
          ) : null}
        </div>
      </div>

      <div className="desktop:min-h-0 desktop:flex-1 desktop:overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center p-6 text-center text-sm text-app-text-muted tablet:p-8 desktop:h-full">
            Loading contacts...
          </div>
        ) : contacts.length === 0 ? (
          <div className="flex items-center justify-center p-6 text-center text-sm text-app-text-muted tablet:p-8 desktop:h-full">
            {hasFilters
              ? 'No contacts match your search or filter.'
              : canManage
                ? 'No contacts yet. Click Create to add your first contact.'
                : 'No contacts yet.'}
          </div>
        ) : (
          <>
            {/* Mobile card list */}
            <div className="divide-y divide-app-border tablet:hidden">
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
                        <p className="truncate font-medium text-app-text">
                          {contact.firstName} {contact.lastName}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-app-text-muted">
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
                          'bg-app-surface-muted text-app-text-secondary'
                        }`}
                      >
                        {contact.status}
                      </span>
                      {contact.companyName ? (
                        <span className="truncate text-xs text-app-text-muted">
                          {contact.companyName}
                        </span>
                      ) : null}
                      {contact.phone ? (
                        <span className="truncate text-xs text-app-text-muted">
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
                <thead className="sticky top-0 z-10 bg-app-surface-muted">
                  <tr className="border-b border-app-border text-xs font-semibold uppercase tracking-wide text-app-text-muted">
                    <th className="bg-app-surface-muted px-4 py-3">Name</th>
                    <th className="bg-app-surface-muted px-4 py-3">Email</th>
                    <th className="hidden bg-app-surface-muted px-4 py-3 desktop:table-cell">
                      Phone
                    </th>
                    <th className="bg-app-surface-muted px-4 py-3">Company</th>
                    <th className="bg-app-surface-muted px-4 py-3">Status</th>
                    {canManage ? (
                      <th className="bg-app-surface-muted px-4 py-3 text-right">
                        Actions
                      </th>
                    ) : null}
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((contact) => (
                    <tr
                      key={contact.id}
                      className="border-b border-app-border transition-colors hover:bg-app-surface-muted/80"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <ContactAvatar
                            firstName={contact.firstName}
                            lastName={contact.lastName}
                            image={contact.image}
                            size="sm"
                          />
                          <span className="font-medium text-app-text">
                            {contact.firstName} {contact.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="max-w-[12rem] truncate px-4 py-3 text-app-text-secondary xl:max-w-none">
                        {contact.email || '—'}
                      </td>
                      <td className="hidden px-4 py-3 text-app-text-secondary desktop:table-cell">
                        {contact.phone || '—'}
                      </td>
                      <td className="max-w-[10rem] truncate px-4 py-3 text-app-text-secondary desktop:max-w-none">
                        {contact.companyName || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded px-2 py-0.5 text-[11px] font-semibold ${
                            statusBadgeClass[contact.status] ||
                            'bg-app-surface-muted text-app-text-secondary'
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

      <div className="flex shrink-0 flex-col gap-3 border-t border-app-border px-3 py-3 mobile:flex-row mobile:items-center mobile:justify-between tablet:px-4">
        <p className="text-xs text-app-text-muted">
          {total === 0
            ? 'No contacts'
            : `Showing ${from}-${to} of ${total} · Page ${page} of ${totalPages} · 10 / page`}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1 || isLoading}
            onClick={() => onPageChange(page - 1)}
            className="h-8 flex-1 rounded-md border border-app-border px-3 text-xs font-medium text-app-text-secondary transition-colors hover:bg-app-surface-muted disabled:cursor-not-allowed disabled:opacity-40 mobile:flex-none"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={page >= totalPages || isLoading || total === 0}
            onClick={() => onPageChange(page + 1)}
            className="h-8 flex-1 rounded-md border border-app-border px-3 text-xs font-medium text-app-text-secondary transition-colors hover:bg-app-surface-muted disabled:cursor-not-allowed disabled:opacity-40 mobile:flex-none"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

export default ContactsTable
