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
        className="flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
      >
        <LogoutOutlined fontSize="small" />
        <span className="font-medium">Logout</span>
      </button>
    </div>
  )
}

export default UserMenuActions
