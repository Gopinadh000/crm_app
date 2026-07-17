import { MenuRounded } from '@mui/icons-material'
import logocrm from '../../../assets/logo.png'
import UserMenu from './user-menu/UserMenu'

type NavBarProps = {
  onMenuClick?: () => void
  sidebarOpen?: boolean
}

const NavBar = ({ onMenuClick, sidebarOpen = false }: NavBarProps) => {
  return (
    <header className="flex h-16 w-full shrink-0 items-center border-b border-app-border bg-app-surface px-3 tablet:h-[4.5rem] tablet:px-5">
      <div className="flex w-full items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            aria-label={
              sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'
            }
            aria-expanded={sidebarOpen}
            onClick={onMenuClick}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-app-border text-app-text-secondary transition-colors hover:bg-app-surface-muted desktop:hidden"
          >
            <MenuRounded />
          </button>

          <img
            src={logocrm}
            alt="MiniCRM"
            className="h-10 w-auto max-w-[8.5rem] object-contain object-left desktop:hidden"
          />
        </div>

        <div className="ml-auto flex shrink-0 items-center">
          <UserMenu />
        </div>
      </div>
    </header>
  )
}

export default NavBar
