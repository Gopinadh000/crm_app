import { useEffect, useState } from 'react'
import PageTitle from '../../components/common/page-title/PageTitle'
import ActivityLogsTable from './components/ActivityLogsTable'
import {
  fetchActivityLogs,
  fetchAllActivityLogs,
  type ActivityLog,
  type ActivityLogsPagination,
} from '../../services/api/activity-logs/activityLogs.api'
import { buildExportFilename, downloadCsv } from '../../utils/csv'

const PAGE_SIZE = 10

const emptyPagination: ActivityLogsPagination = {
  page: 1,
  limit: PAGE_SIZE,
  total: 0,
  totalPages: 1,
}

const ActivityLogsPage = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [pagination, setPagination] =
    useState<ActivityLogsPagination>(emptyPagination)
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
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

    const loadLogs = async () => {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const data = await fetchActivityLogs({
          page,
          limit: PAGE_SIZE,
          search: debouncedSearch,
        })

        if (cancelled) return

        setLogs(data.logs)
        setPagination(data.pagination)

        if (data.pagination.page !== page) {
          setPage(data.pagination.page)
        }
      } catch (err: unknown) {
        if (cancelled) return
        const message =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || 'Unable to load activity logs'
        setErrorMessage(message)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void loadLogs()

    return () => {
      cancelled = true
    }
  }, [page, debouncedSearch])

  const handleExportCsv = async () => {
    if (isExporting) return

    setIsExporting(true)
    setErrorMessage('')

    try {
      const rows = await fetchAllActivityLogs({
        search: debouncedSearch,
      })

      downloadCsv(
        buildExportFilename('activity-logs'),
        ['Action', 'Entity', 'Entity Id', 'Description', 'User', 'Email', 'Date'],
        rows.map((log) => [
          log.action,
          log.entityType,
          log.entityId,
          log.description,
          log.userName ||
            `${log.userFirstName || ''} ${log.userLastName || ''}`.trim(),
          log.userEmail,
          log.createdAt,
        ]),
      )
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Unable to export activity logs'
      setErrorMessage(message)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="flex min-h-0 flex-col gap-3 tablet:gap-4 desktop:h-full">
      <PageTitle title="Activity Logs" />

      {errorMessage ? (
        <div className="shrink-0 rounded-sm bg-app-error-soft px-3 py-2.5 text-sm text-app-error tablet:px-4 tablet:py-3">
          {errorMessage}
        </div>
      ) : null}

      <ActivityLogsTable
        logs={logs}
        isLoading={isLoading}
        isExporting={isExporting}
        search={searchInput}
        onSearchChange={setSearchInput}
        pagination={pagination}
        onPageChange={setPage}
        onExportCsv={handleExportCsv}
      />
    </div>
  )
}

export default ActivityLogsPage
