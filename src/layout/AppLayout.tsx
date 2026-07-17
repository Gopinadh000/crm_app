import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import NavBar from '../components/ui/navbar/NavBar'
import SideBar from '../components/ui/sidebar/SideBar'
import MainContainer from '../components/ui/main-container/MainContainer'
import AppRoutes from '../routes/app-routes/AppRoutes'

const AppLayout = () => {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Close mobile drawer on route change
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  // Close drawer when viewport reaches desktop
  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)')
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setSidebarOpen(false)
    }

    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (!sidebarOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [sidebarOpen])

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-app-surface text-app-text">
      <SideBar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <NavBar
          onMenuClick={() => setSidebarOpen((open) => !open)}
          sidebarOpen={sidebarOpen}
        />
        <MainContainer>
          <AppRoutes />
        </MainContainer>
      </div>
    </div>
  )
}

export default AppLayout
