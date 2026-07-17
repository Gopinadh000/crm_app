import type { RecentContact } from '../../../services/api/dashboard/dashboard.api'
import ContactAvatar from '../../contacts-page/components/ContactAvatar'

type RecentContactsTableProps = {
  contacts: RecentContact[]
  isLoading?: boolean
}

const statusBadgeClass: Record<string, string> = {
  Lead: 'bg-app-warning-soft text-app-warning',
  Prospect: 'bg-app-primary-50 text-app-primary-800',
  Customer: 'bg-app-success-soft text-app-success',
}

const formatDate = (value?: string) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const RecentContactsTable = ({
  contacts,
  isLoading = false,
}: RecentContactsTableProps) => {
  return (
    <div className="flex flex-col rounded-sm bg-app-surface shadow-sm desktop:min-h-0 desktop:flex-1 desktop:overflow-hidden">
      <div className="flex shrink-0 items-center justify-between border-b border-app-border px-3 py-3 tablet:px-4">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-app-text tablet:text-base">
            Recently Added Contacts
          </h2>
          <p className="mt-0.5 text-xs text-app-text-muted">
            Latest 5 contacts added to your workspace
          </p>
        </div>
      </div>

      <div className="desktop:min-h-0 desktop:flex-1 desktop:overflow-auto">
        {isLoading ? (
          <div className="flex h-full items-center justify-center p-6 text-sm text-app-text-muted tablet:p-8">
            Loading recent contacts...
          </div>
        ) : contacts.length === 0 ? (
          <div className="flex h-full items-center justify-center p-6 text-sm text-app-text-muted tablet:p-8">
            No contacts added yet.
          </div>
        ) : (
          <>
            <div className="divide-y divide-app-border tablet:hidden">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center gap-3 px-3 py-3"
                >
                  <ContactAvatar
                    firstName={contact.firstName}
                    lastName={contact.lastName}
                    image={contact.image}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-app-text">
                      {contact.firstName} {contact.lastName}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-app-text-muted">
                      {contact.email || contact.companyName || '—'}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span
                      className={`inline-flex rounded px-2 py-0.5 text-[11px] font-semibold ${
                        statusBadgeClass[contact.status] ||
                        'bg-app-surface-muted text-app-text-secondary'
                      }`}
                    >
                      {contact.status}
                    </span>
                    <span className="text-[11px] text-app-text-muted">
                      {formatDate(contact.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden min-w-0 overflow-x-auto tablet:block">
              <table className="min-w-[560px] w-full border-collapse text-left text-sm desktop:min-w-full">
                <thead className="sticky top-0 z-10 bg-app-surface-muted">
                  <tr className="border-b border-app-border text-xs font-semibold uppercase tracking-wide text-app-text-muted">
                    <th className="bg-app-surface-muted px-4 py-3">Name</th>
                    <th className="bg-app-surface-muted px-4 py-3">Email</th>
                    <th className="hidden bg-app-surface-muted px-4 py-3 desktop:table-cell">
                      Company
                    </th>
                    <th className="bg-app-surface-muted px-4 py-3">Status</th>
                    <th className="bg-app-surface-muted px-4 py-3">Added</th>
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
                      <td className="max-w-[12rem] truncate px-4 py-3 text-app-text-secondary">
                        {contact.email || '—'}
                      </td>
                      <td className="hidden px-4 py-3 text-app-text-secondary desktop:table-cell">
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
                      <td className="whitespace-nowrap px-4 py-3 text-app-text-secondary">
                        {formatDate(contact.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default RecentContactsTable
