import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Popover } from '@mui/material'
import { useAuth } from '../../../../services/context/AuthContext'
import UserMenuTrigger from './UserMenuTrigger'
import UserProfileCard from './UserProfileCard'
import UserMenuActions from './UserMenuActions'

const UserMenu = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const open = Boolean(anchorEl)
  const name = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : 'User'
  const roleLabel = user?.role || 'USER'
  const avatarUrl = undefined

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = async () => {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    handleClose()
    try {
      await logout()
    } finally {
      navigate('/login', { replace: true })
      setIsLoggingOut(false)
    }
  }

  return (
    <>
      <UserMenuTrigger
        name={name}
        avatarUrl={avatarUrl}
        onClick={handleOpen}
      />

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              minWidth: 240,
              borderRadius: '8px',
              boxShadow:
                '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
              border: '1px solid #e5e7eb',
            },
          },
        }}
      >
        <UserProfileCard name={name} role={roleLabel} avatarUrl={avatarUrl} />
        <UserMenuActions onLogout={handleLogout} />
      </Popover>
    </>
  )
}

export default UserMenu
