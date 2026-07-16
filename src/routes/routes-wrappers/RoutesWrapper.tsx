import { Route, Routes } from 'react-router-dom'
import LoginPage from '../../pages/auth-pages/login-page/LoginPage'
import RegisterPage from '../../pages/auth-pages/register-page/RegisterPage'
import PageNotFound from '../../pages/not-found-pages/PageNotFound'
import AppLayout from '../../layout/AppLayout'
import PublicRoutes from './PublicRoutes'
import ProtectedRoutes from './ProtectedRoutes'

const RoutesWrapper = () => {
  return (
    <Routes>
      {/* Public routes — redirect to home if already authenticated */}
      <Route element={<PublicRoutes />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Protected routes — require authentication */}
      <Route element={<ProtectedRoutes />}>
        <Route path="/*" element={<AppLayout />} />
      </Route>

      {/* Fallback 404 */}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  )
}

export default RoutesWrapper
