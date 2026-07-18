import { DownloadOutlined, Search } from '@mui/icons-material'
import Button from '../../../components/common/button/Button'
import type {
  ActivityLog,
  ActivityLogsPagination,
} from '../../../services/api/activity-logs/activityLogs.api'

type ActivityLogsTableProps = {
  logs: ActivityLog[]
  isLoading?: boolean
  isExporting?: boolean
  search: string
  onSearchChange: (value: string) => void
  pagination: ActivityLogsPagination
  onPageChange: (page: number) => void
  onExportCsv?: () => void
}

const actionStyles: Record<string, string> = {
  CREATE: 'bg-app-success-soft text-app-success',
  UPDATE: 'bg-app-primary-50 text-app-primary-800',
  DELETE: 'bg-app-error-soft text-app-error',
  LOGIN: 'bg-app-primary-50 text-app-primary-800',
  LOGOUT: 'bg-app-surface-muted text-app-text-secondary',
  REGISTER: 'bg-app-warning-soft text-app-warning',
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
  isExporting = false,
  search,
  onSearchChange,
  pagination,
  onPageChange,
  onExportCsv,
}: ActivityLogsTableProps) => {
  const { page, limit, total, totalPages } = pagination
  const from = total === 0 ? 0 : (page - 1) * limit + 1
  const to = Math.min(page * limit, total)

  return (
    <div className="flex flex-col rounded-sm bg-app-surface desktop:min-h-0 desktop:flex-1 desktop:overflow-hidden">
      <div className="flex shrink-0 flex-col gap-3 border-b border-app-border px-3 py-3 tablet:px-4 mobile:flex-row mobile:items-center mobile:justify-end">
        <div className="flex w-full flex-col gap-3 mobile:flex-row mobile:items-center mobile:justify-end">
          <div className="relative w-full mobile:w-72 mobile:max-w-sm">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-app-text-muted"
              sx={{ fontSize: 18 }}
            />
            <input
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by action or description"
              className="h-9 w-full rounded-md border border-app-border bg-app-surface pl-9 pr-3 text-sm text-app-text outline-none transition-colors placeholder:text-app-text-muted hover:border-app-border-strong focus:border-app-primary-500 focus:ring-2 focus:ring-app-primary-100"
            />
          </div>

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
            Loading activity logs...
          </div>
        ) : logs.length === 0 ? (
          <div className="flex items-center justify-center p-6 text-center text-sm text-app-text-muted tablet:p-8 desktop:h-full">
            {search.trim()
              ? 'No activity logs match your search.'
              : 'No activity logs yet. Actions like login and contact changes will appear here.'}
          </div>
        ) : (
          <>
            {/* Mobile card list */}
            <div className="divide-y divide-app-border tablet:hidden">
              {logs.map((log) => (
                <div key={log.id} className="space-y-2 px-3 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                        actionStyles[log.action] || 'bg-app-surface-muted text-app-text-secondary'
                      }`}
                    >
                      {log.action}
                    </span>
                    <span className="text-xs text-app-text-muted">
                      {log.entityType}
                    </span>
                  </div>
                  <p className="text-sm text-app-text">{log.description}</p>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-app-text-muted">
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
                <thead className="sticky top-0 z-10 bg-app-surface-muted">
                  <tr className="border-b border-app-border text-xs font-semibold uppercase tracking-wide text-app-text-muted">
                    <th className="bg-app-surface-muted px-4 py-3">Action</th>
                    <th className="bg-app-surface-muted px-4 py-3">Entity</th>
                    <th className="bg-app-surface-muted px-4 py-3">Description</th>
                    <th className="hidden bg-app-surface-muted px-4 py-3 desktop:table-cell">
                      User
                    </th>
                    <th className="bg-app-surface-muted px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-app-border transition-colors hover:bg-app-surface-muted/80"
                    >
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                            actionStyles[log.action] ||
                            'bg-app-surface-muted text-app-text-secondary'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-app-text-secondary">
                        {log.entityType}
                      </td>
                      <td className="max-w-xs px-4 py-3 text-app-text desktop:max-w-md">
                        <span className="line-clamp-2">{log.description}</span>
                      </td>
                      <td className="hidden max-w-[10rem] truncate px-4 py-3 text-app-text-secondary desktop:table-cell">
                        {log.userName || log.userEmail || '—'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-app-text-secondary">
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

      <div className="flex shrink-0 flex-col gap-3 border-t border-app-border px-3 py-3 mobile:flex-row mobile:items-center mobile:justify-between tablet:px-4">
        <p className="text-xs text-app-text-muted">
          {total === 0
            ? 'No logs'
            : `Showing ${from}-${to} of ${total} · Page ${page} of ${totalPages}`}
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

export default ActivityLogsTable
