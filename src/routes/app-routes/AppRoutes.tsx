import { Route, Routes } from 'react-router-dom'
import DashboardPage from '../../pages/dashboard-page/DashboardPage'
import ContactsPage from '../../pages/contacts-page/ContactsPage'
import ActivityLogsPage from '../../pages/activitylogs-page/ActivityLogsPage'
import PageNotFound from '../../pages/not-found-pages/PageNotFound'

const routesList = [
  { id: 1, path: '/', element: <DashboardPage /> },
  { id: 2, path: '/contacts', element: <ContactsPage /> },
  { id: 3, path: '/activity-logs', element: <ActivityLogsPage /> },
  { id: 4, path: '*', element: <PageNotFound /> },
]

const AppRoutes = () => {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <Routes>
        {routesList.map((route) => (
          <Route key={route.id} path={route.path} element={route.element} />
        ))}
      </Routes>
    </div>
  )
}

export default AppRoutes
