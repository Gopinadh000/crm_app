import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

const baseURL =
  import.meta.env.VITE_INSTANCE_TYPE === 'PROD'
    ? import.meta.env.VITE_API_URL_PROD
    : import.meta.env.VITE_API_URL_LOCAL

export const apiInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiInstance.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    // Let the browser set multipart boundary
    if (config.headers) {
      delete config.headers['Content-Type']
    }
  }
  return config
})

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean }

let isRefreshing = false
let refreshQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (error: unknown | null) => {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve()
  })
  refreshQueue = []
}

const isAuthPublicRoute = (url?: string) =>
  Boolean(
    url?.includes('/auth/login') ||
      url?.includes('/auth/register') ||
      url?.includes('/auth/refresh'),
  )

apiInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryConfig | undefined
    const status = error.response?.status

    if (!originalRequest || status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    if (isAuthPublicRoute(originalRequest.url)) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject })
      }).then(() => apiInstance(originalRequest))
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      await apiInstance.post('/v1/auth/refresh')
      processQueue(null)
      return apiInstance(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError)

      const onPublicAuthPage =
        window.location.pathname === '/login' ||
        window.location.pathname === '/register'

      if (!onPublicAuthPage) {
        window.location.replace('/login')
      }

      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)
