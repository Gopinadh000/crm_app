import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Popover } from '@mui/material'
import { useAuth } from '../../../../services/context/AuthContext'
import UserMenuTrigger from './UserMenuTrigger'
import UserProfileCard from './UserProfileCard'
import UserMenuActions from './UserMenuActions'
import ThemeControls from './ThemeControls'

const UserMenu = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const open = Boolean(anchorEl)
  const name = user ? `${user.firstName} ${user.lastName}`.trim() : 'User'
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
              minWidth: 260,
              borderRadius: '8px',
              boxShadow: 'var(--app-shadow)',
              border: '1px solid var(--app-border)',
              backgroundColor: 'var(--app-surface)',
              color: 'var(--app-text)',
            },
          },
        }}
      >
        <UserProfileCard name={name} role={roleLabel} avatarUrl={avatarUrl} />
        <ThemeControls />
        <UserMenuActions onLogout={handleLogout} />
      </Popover>
    </>
  )
}

export default UserMenu
