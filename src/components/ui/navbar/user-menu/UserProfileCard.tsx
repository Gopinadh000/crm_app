type UserProfileCardProps = {
  name: string
  role: string
  avatarUrl?: string
}

const UserProfileCard = ({ name, role, avatarUrl }: UserProfileCardProps) => {
  const initials = name.charAt(0).toUpperCase() || 'U'

  return (
    <div className="flex items-center gap-3 border-b border-app-border px-4 py-3">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          className="h-10 w-10 rounded-full border border-app-border object-cover"
        />
      ) : (
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-app-primary-500 text-base font-semibold text-app-text-inverse">
          {initials}
        </span>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-app-text">{name}</p>
        <span className="mt-1 inline-block rounded bg-app-primary-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-app-primary-800">
          {role}
        </span>
      </div>
    </div>
  )
}

export default UserProfileCard
