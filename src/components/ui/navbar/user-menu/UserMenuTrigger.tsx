type UserMenuTriggerProps = {
  name: string
  avatarUrl?: string
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
}

const UserMenuTrigger = ({ name, avatarUrl, onClick }: UserMenuTriggerProps) => {
  const initials = name.charAt(0).toUpperCase() || 'U'

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex cursor-pointer items-center gap-2 rounded-md border border-app-border px-2 py-1 transition-colors hover:bg-app-surface-muted"
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          className="h-9 w-9 rounded-full border border-app-border object-cover"
        />
      ) : (
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-app-primary-500 text-sm font-semibold text-app-text-inverse">
          {initials}
        </span>
      )}
      <span className="hidden max-w-24 truncate text-sm font-medium text-app-text tablet:inline tablet:max-w-28 desktop:max-w-36">
        {name}
      </span>
    </button>
  )
}

export default UserMenuTrigger
