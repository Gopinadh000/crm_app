import { Search } from '@mui/icons-material'
import type {
  ActivityLog,
  ActivityLogsPagination,
} from '../../../services/api/activity-logs/activityLogs.api'

type ActivityLogsTableProps = {
  logs: ActivityLog[]
  isLoading?: boolean
  search: string
  onSearchChange: (value: string) => void
  pagination: ActivityLogsPagination
  onPageChange: (page: number) => void
}

const actionStyles: Record<string, string> = {
  CREATE: 'bg-emerald-50 text-emerald-700',
  UPDATE: 'bg-blue-50 text-blue-700',
  DELETE: 'bg-red-50 text-red-700',
  LOGIN: 'bg-indigo-50 text-indigo-700',
  LOGOUT: 'bg-gray-100 text-gray-700',
  REGISTER: 'bg-amber-50 text-amber-700',
}

const formatDateTime = (value?: string) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const ActivityLogsTable = ({
  logs,
  isLoading = false,
  search,
  onSearchChange,
  pagination,
  onPageChange,
}: ActivityLogsTableProps) => {
  const { page, limit, total, totalPages } = pagination
  const from = total === 0 ? 0 : (page - 1) * limit + 1
  const to = Math.min(page * limit, total)

  return (
    <div className="flex flex-col rounded-sm bg-white desktop:min-h-0 desktop:flex-1 desktop:overflow-hidden">
      <div className="flex shrink-0 flex-col gap-3 border-b border-gray-100 px-3 py-3 tablet:px-4 mobile:flex-row mobile:items-center mobile:justify-end">
        <div className="relative w-full mobile:w-72 mobile:max-w-sm">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            sx={{ fontSize: 18 }}
          />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by action or description"
            className="h-9 w-full rounded-md border border-gray-300 bg-white pl-9 pr-3 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      <div className="desktop:min-h-0 desktop:flex-1 desktop:overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center p-6 text-center text-sm text-gray-500 tablet:p-8 desktop:h-full">
            Loading activity logs...
          </div>
        ) : logs.length === 0 ? (
          <div className="flex items-center justify-center p-6 text-center text-sm text-gray-500 tablet:p-8 desktop:h-full">
            {search.trim()
              ? 'No activity logs match your search.'
              : 'No activity logs yet. Actions like login and contact changes will appear here.'}
          </div>
        ) : (
          <>
            {/* Mobile card list */}
            <div className="divide-y divide-gray-100 tablet:hidden">
              {logs.map((log) => (
                <div key={log.id} className="space-y-2 px-3 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                        actionStyles[log.action] || 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {log.action}
                    </span>
                    <span className="text-xs text-gray-500">
                      {log.entityType}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800">{log.description}</p>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
                    <span className="truncate">
                      {log.userName || log.userEmail || '—'}
                    </span>
                    <span className="whitespace-nowrap">
                      {formatDateTime(log.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Tablet+ table */}
            <div className="hidden min-w-0 overflow-x-auto tablet:block">
              <table className="min-w-[720px] w-full border-collapse text-left text-sm desktop:min-w-full">
                <thead className="sticky top-0 z-10 bg-gray-50">
                  <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th className="bg-gray-50 px-4 py-3">Action</th>
                    <th className="bg-gray-50 px-4 py-3">Entity</th>
                    <th className="bg-gray-50 px-4 py-3">Description</th>
                    <th className="hidden bg-gray-50 px-4 py-3 desktop:table-cell">
                      User
                    </th>
                    <th className="bg-gray-50 px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-gray-50 transition-colors hover:bg-gray-50/80"
                    >
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                            actionStyles[log.action] ||
                            'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                        {log.entityType}
                      </td>
                      <td className="max-w-xs px-4 py-3 text-gray-800 desktop:max-w-md">
                        <span className="line-clamp-2">{log.description}</span>
                      </td>
                      <td className="hidden max-w-[10rem] truncate px-4 py-3 text-gray-600 desktop:table-cell">
                        {log.userName || log.userEmail || '—'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                        {formatDateTime(log.createdAt)}
                      </td>
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
            ? 'No logs'
            : `Showing ${from}-${to} of ${total} · Page ${page} of ${totalPages}`}
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

export default ActivityLogsTable
