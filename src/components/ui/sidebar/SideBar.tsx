import { NavLink } from 'react-router-dom'
import {
  CloseRounded,
  DashboardOutlined,
  TaskAltOutlined,
} from '@mui/icons-material'
import logocrm from '../../../assets/logo.png'
import ContactsOutlinedIcon from '@mui/icons-material/ContactsOutlined';

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
      {/* Mobile / tablet overlay */}
      <button
        type="button"
        aria-label="Close navigation menu"
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity desktop:hidden ${
          open
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-[min(16.5rem,85vw)] flex-col border-r border-gray-200 bg-white transition-transform duration-200 ease-out desktop:static desktop:z-auto desktop:w-60 desktop:translate-x-0 desktop:shrink-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-gray-200 px-3 tablet:h-[4.5rem]">
          <img
            src={logocrm}
            alt="MiniCRM"
            className="h-12 w-auto max-w-[10rem] object-contain object-left tablet:h-14 tablet:max-w-[12rem]"
          />
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 desktop:hidden"
          >
            <CloseRounded fontSize="small" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3 mt-10 tablet:p-4">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.path === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-700 before:absolute before:inset-y-1 before:left-0 before:w-1 before:rounded-r before:bg-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
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
