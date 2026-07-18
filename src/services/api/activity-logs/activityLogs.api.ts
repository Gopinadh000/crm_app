import { apiInstance } from '../axios-setup/axiosInstance'

export type ActivityLog = {
  id: number
  userId: number
  action: string
  entityType: string
  entityId?: number | null
  description: string
  metadata?: Record<string, unknown> | null
  createdAt: string
  userFirstName?: string
  userLastName?: string
  userEmail?: string
  userName?: string
}

export type ActivityLogsPagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type ActivityLogsListResponse = {
  logs: ActivityLog[]
  pagination: ActivityLogsPagination
}

export type FetchActivityLogsParams = {
  page?: number
  limit?: number
  search?: string
}

export const fetchActivityLogs = async (
  params: FetchActivityLogsParams = {},
): Promise<ActivityLogsListResponse> => {
  const { data } = await apiInstance.get('/v1/activity-logs', {
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      search: params.search?.trim() || undefined,
    },
  })

  return data.data as ActivityLogsListResponse
}

/** Fetch every page matching current search (API max limit is 50). */
export const fetchAllActivityLogs = async (
  params: Omit<FetchActivityLogsParams, 'page' | 'limit'> = {},
): Promise<ActivityLog[]> => {
  const all: ActivityLog[] = []
  let page = 1
  let totalPages = 1

  do {
    const data = await fetchActivityLogs({
      ...params,
      page,
      limit: 50,
    })
    all.push(...data.logs)
    totalPages = data.pagination.totalPages
    page += 1
  } while (page <= totalPages)

  return all
}
