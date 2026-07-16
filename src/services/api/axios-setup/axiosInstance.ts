import axios from 'axios'

const baseUrlValue =
  import.meta.env.VITE_INSTANCE_TYPE == 'PROD'
    ? import.meta.env.VITE_API_URL_PROD
    : import.meta.env.VITE_API_URL_LOCAL

export const apiInstance = axios.create({
  baseURL: baseUrlValue,
  withCredentials: true, // IMPORTANT: send cookies with every request
  headers: {
    'Content-Type': 'application/json',
  },
})

apiInstance.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    // Let the browser set multipart boundary for contact image uploads
    if (config.headers) {
      delete config.headers['Content-Type']
    }
  }
  return config
})

// Response interceptor to handle 401 errors globally
apiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const message = String(
        error?.response?.data?.message || '',
      ).toLowerCase()
      const isTokenExpiry =
        message.includes('token has expired') ||
        message.includes('expired token') ||
        message.includes('authentication required') ||
        message.includes('invalid token') ||
        message.includes('unauthorized')
      const onAuthPage =
        window.location.pathname === '/login' ||
        window.location.pathname === '/register'

      // Force a clean re-auth when cookie jwt expires
      if (isTokenExpiry && !onAuthPage) {
        console.warn('Session expired. Redirecting to login.')
        window.location.replace('/login')
      }
    }
    return Promise.reject(error)
  },
)
