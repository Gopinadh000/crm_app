import { useEffect, type ReactNode } from 'react'
import { Close } from '@mui/icons-material'

type ModalSize = 'sm' | 'md' | 'lg' | 'xl'
type ModalVariant = 'center' | 'side'

type ModalProps = {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  footer?: ReactNode
  variant?: ModalVariant
  size?: ModalSize
  showCloseButton?: boolean
}

const centerSizeClasses: Record<ModalSize, string> = {
  sm: 'w-[calc(100%-1.5rem)] max-w-sm',
  md: 'w-[calc(100%-1.5rem)] max-w-md',
  lg: 'w-[calc(100%-1.5rem)] max-w-lg',
  xl: 'w-[calc(100%-1.5rem)] max-w-2xl',
}

const sideSizeClasses: Record<ModalSize, string> = {
  sm: 'w-full max-w-full tablet:max-w-sm',
  md: 'w-full max-w-full tablet:max-w-md',
  lg: 'w-full max-w-full tablet:max-w-lg',
  xl: 'w-full max-w-full tablet:max-w-xl',
}

const Modal = ({
  open,
  onClose,
  title,
  children,
  footer,
  variant = 'center',
  size = 'md',
  showCloseButton = true,
}: ModalProps) => {
  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  const isSide = variant === 'side'

  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Close modal backdrop"
        className="absolute inset-0 bg-[var(--app-overlay)] transition-opacity"
        onClick={onClose}
      />

      <div
        className={
          isSide
            ? `relative ml-auto flex h-dvh ${sideSizeClasses[size]} flex-col rounded-none bg-app-surface shadow-[var(--app-shadow)] animate-[slideInRight_0.22s_ease-out] tablet:rounded-l-xl`
            : `relative m-auto flex max-h-[90dvh] ${centerSizeClasses[size]} flex-col rounded-xl bg-app-surface shadow-[var(--app-shadow)] animate-[fadeInScale_0.18s_ease-out]`
        }
        style={{ backgroundColor: 'var(--app-surface, #ffffff)' }}
      >
        {(title || showCloseButton) && (
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-app-border px-4 py-2 tablet:px-5">
            <div className="min-w-0 flex-1">
              {title ? (
                <h2 className="truncate text-sm font-semibold text-app-text tablet:text-base">
                  {title}
                </h2>
              ) : null}
            </div>
            {showCloseButton ? (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-app-text-muted transition-colors hover:bg-app-surface-muted hover:text-app-text"
              >
                <Close sx={{ fontSize: 18 }} />
              </button>
            ) : null}
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 text-app-text tablet:px-5">
          {children}
        </div>

        {footer ? (
          <div className="shrink-0 border-t border-app-border bg-app-surface px-4 py-2 tablet:px-5">
            {footer}
          </div>
        ) : null}
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0.85; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeInScale {
          from { transform: scale(0.96); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export default Modal
