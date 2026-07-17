import { useState } from 'react'
import { MoreVert, type SvgIconComponent } from '@mui/icons-material'
import { Popover } from '@mui/material'

export type ThreeDotsMenuItem = {
  label: string
  onClick: () => void
  icon?: SvgIconComponent
  danger?: boolean
}

type ThreeDotsMenuProps = {
  items: ThreeDotsMenuItem[]
  ariaLabel?: string
}

const ThreeDotsMenu = ({
  items,
  ariaLabel = 'Open actions menu',
}: ThreeDotsMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const open = Boolean(anchorEl)

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleItemClick = (item: ThreeDotsMenuItem) => {
    handleClose()
    item.onClick()
  }

  return (
    <>
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={handleOpen}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-app-text-muted transition-colors hover:bg-app-surface-muted hover:text-app-text"
      >
        <MoreVert fontSize="small" />
      </button>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              mt: 0.5,
              minWidth: 180,
              borderRadius: '8px',
              boxShadow: 'var(--app-shadow)',
              border: '1px solid var(--app-border)',
              backgroundColor: 'var(--app-surface)',
              color: 'var(--app-text)',
            },
          },
        }}
      >
        <div className="py-1">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => handleItemClick(item)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-app-surface-muted ${
                  item.danger
                    ? 'text-app-error hover:bg-app-error-soft'
                    : 'text-app-text-secondary'
                }`}
              >
                {Icon ? <Icon fontSize="small" /> : null}
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>
      </Popover>
    </>
  )
}

export default ThreeDotsMenu
