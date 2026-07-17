import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../services/context/AuthContext'

/**
 * Public routes (login, register).
 * Redirects authenticated users to the dashboard.
 */
const PublicRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
          <p className="mt-4 text-app-text-muted">Loading...</p>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default PublicRoutes
