import { useEffect, useState } from 'react'
import PageTitle from '../../components/common/page-title/PageTitle'
import ActivityLogsTable from './components/ActivityLogsTable'
import {
  fetchActivityLogs,
  type ActivityLog,
  type ActivityLogsPagination,
} from '../../services/api/activity-logs/activityLogs.api'

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

  return (
    <div className="flex min-h-0 flex-col gap-3 tablet:gap-4 desktop:h-full">
      <PageTitle title="Activity Logs" />

      {errorMessage ? (
        <div className="shrink-0 rounded-sm bg-red-50 px-3 py-2.5 text-sm text-red-600 tablet:px-4 tablet:py-3">
          {errorMessage}
        </div>
      ) : null}

      <ActivityLogsTable
        logs={logs}
        isLoading={isLoading}
        search={searchInput}
        onSearchChange={setSearchInput}
        pagination={pagination}
        onPageChange={setPage}
      />
    </div>
  )
}

export default ActivityLogsPage
