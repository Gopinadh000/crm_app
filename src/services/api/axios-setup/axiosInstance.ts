import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

/**
 * Backend routes are mounted at `/api/v1`.
 * Netlify must set:
 *   VITE_INSTANCE_TYPE=PROD
 *   VITE_API_URL_PROD=https://crm-app-xwws.onrender.com/api
 *
 * This helper always forces a base URL ending in `/api`, even if `/api` was omitted in env.
 */
const resolveBaseURL = (): string => {
  const isProd = String(import.meta.env.VITE_INSTANCE_TYPE || '')
    .trim()
    .toUpperCase() === 'PROD'

  const raw = isProd
    ? import.meta.env.VITE_API_URL_PROD
    : import.meta.env.VITE_API_URL_LOCAL

  let base = String(raw || '')
    .trim()
    .replace(/^['"]+|['"]+$/g, '')
    .replace(/\/+$/, '')

  if (!base) {
    console.error(
      '[API] Missing API base URL. Set VITE_API_URL_PROD (and VITE_INSTANCE_TYPE=PROD) on Netlify, then redeploy.',
    )
    return ''
  }

  // https://host  → https://host/api
  // https://host/api → unchanged
  // https://host/api/v1 → normalize back to https://host/api
  if (base.endsWith('/api/v1')) {
    base = base.slice(0, -3) // remove /v1
  } else if (!base.endsWith('/api')) {
    base = `${base}/api`
  }

  return base
}

const baseURL = resolveBaseURL()

if (import.meta.env.DEV || import.meta.env.VITE_INSTANCE_TYPE === 'PROD') {
  console.info('[API] baseURL =', baseURL || '(empty)')
}

export const apiInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiInstance.interceptors.request.use((config) => {
  // Ensure path joins as /api + /v1/... (never lose /api)
  if (config.url?.startsWith('/')) {
    config.url = config.url.replace(/^\/+/, '')
  }

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
