import { NavLink } from 'react-router-dom'
import {
  CloseRounded,
  DashboardOutlined,
  TaskAltOutlined,
} from '@mui/icons-material'
import ContactsOutlinedIcon from '@mui/icons-material/ContactsOutlined'
import logocrm from '../../../assets/logo.png'

type SideBarProps = {
  open?: boolean
  onClose?: () => void
}

const sidebarItems = [
  {
    id: 1,
    label: 'Dash board',
    icon: <DashboardOutlined fontSize="small" />,
    path: '/',
  },
  {
    id: 2,
    label: 'Contacts',
    icon: <ContactsOutlinedIcon fontSize="small" />,
    path: '/contacts',
  },
  {
    id: 3,
    label: 'Activity Logs',
    icon: <TaskAltOutlined fontSize="small" />,
    path: '/activity-logs',
  },
]

const SideBar = ({ open = false, onClose }: SideBarProps) => {
  return (
    <>
      <button
        type="button"
        aria-label="Close navigation menu"
        className={`fixed inset-0 z-40 bg-[var(--app-overlay)] transition-opacity desktop:hidden ${
          open
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-[min(16.5rem,85vw)] flex-col border-r border-app-border bg-app-surface transition-transform duration-200 ease-out desktop:static desktop:z-auto desktop:w-60 desktop:translate-x-0 desktop:shrink-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-app-border px-3 tablet:h-[4.5rem]">
          <img
            src={logocrm}
            alt="MiniCRM"
            className="h-12 w-auto max-w-[10rem] object-contain object-left tablet:h-14 tablet:max-w-[12rem]"
          />
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-app-text-muted transition-colors hover:bg-app-surface-muted hover:text-app-text desktop:hidden"
          >
            <CloseRounded fontSize="small" />
          </button>
        </div>

        <nav className="mt-10 flex flex-1 flex-col gap-1 overflow-y-auto p-3 tablet:p-4">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.path === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-app-primary-100 text-app-primary-800 before:absolute before:inset-y-1 before:left-0 before:w-1 before:rounded-r before:bg-app-primary-500'
                    : 'text-app-text-secondary hover:bg-app-surface-muted'
                }`
              }
            >
              <span className="inline-flex shrink-0">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}

export default SideBar
