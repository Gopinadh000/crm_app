import type { RecentContact } from '../../../services/api/dashboard/dashboard.api'
import ContactAvatar from '../../contacts-page/components/ContactAvatar'

type RecentContactsTableProps = {
  contacts: RecentContact[]
  isLoading?: boolean
}

const statusBadgeClass: Record<string, string> = {
  Lead: 'bg-amber-50 text-amber-700',
  Prospect: 'bg-blue-50 text-blue-700',
  Customer: 'bg-emerald-50 text-emerald-700',
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
    <div className="flex flex-col rounded-sm bg-white shadow-sm desktop:min-h-0 desktop:flex-1 desktop:overflow-hidden">
      <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-3 py-3 tablet:px-4">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-gray-900 tablet:text-base">
            Recently Added Contacts
          </h2>
          <p className="mt-0.5 text-xs text-gray-500">
            Latest 5 contacts added to your workspace
          </p>
        </div>
      </div>

      <div className="desktop:min-h-0 desktop:flex-1 desktop:overflow-auto">
        {isLoading ? (
          <div className="flex h-full items-center justify-center p-6 text-sm text-gray-500 tablet:p-8">
            Loading recent contacts...
          </div>
        ) : contacts.length === 0 ? (
          <div className="flex h-full items-center justify-center p-6 text-sm text-gray-500 tablet:p-8">
            No contacts added yet.
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-100 tablet:hidden">
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
                    <p className="truncate font-medium text-gray-900">
                      {contact.firstName} {contact.lastName}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-gray-500">
                      {contact.email || contact.companyName || '—'}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span
                      className={`inline-flex rounded px-2 py-0.5 text-[11px] font-semibold ${
                        statusBadgeClass[contact.status] ||
                        'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {contact.status}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {formatDate(contact.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden min-w-0 overflow-x-auto tablet:block">
              <table className="min-w-[560px] w-full border-collapse text-left text-sm desktop:min-w-full">
                <thead className="sticky top-0 z-10 bg-gray-50">
                  <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th className="bg-gray-50 px-4 py-3">Name</th>
                    <th className="bg-gray-50 px-4 py-3">Email</th>
                    <th className="hidden bg-gray-50 px-4 py-3 desktop:table-cell">
                      Company
                    </th>
                    <th className="bg-gray-50 px-4 py-3">Status</th>
                    <th className="bg-gray-50 px-4 py-3">Added</th>
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
                      <td className="max-w-[12rem] truncate px-4 py-3 text-gray-600">
                        {contact.email || '—'}
                      </td>
                      <td className="hidden px-4 py-3 text-gray-600 desktop:table-cell">
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
                      <td className="whitespace-nowrap px-4 py-3 text-gray-600">
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
