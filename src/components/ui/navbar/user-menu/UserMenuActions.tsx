import { LogoutOutlined } from '@mui/icons-material'

type UserMenuActionsProps = {
  onLogout: () => void
}

const UserMenuActions = ({ onLogout }: UserMenuActionsProps) => {
  return (
    <div className="p-1.5">
      <button
        type="button"
        onClick={onLogout}
        className="flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-app-error transition-colors hover:bg-app-error-soft"
      >
        <LogoutOutlined fontSize="small" />
        <span className="font-medium">Logout</span>
      </button>
    </div>
  )
}

export default UserMenuActions
