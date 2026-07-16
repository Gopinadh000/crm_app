type ContactAvatarProps = {
  firstName: string
  lastName?: string
  image?: string | null
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-xl',
} as const

const ContactAvatar = ({
  firstName,
  lastName = '',
  image,
  size = 'sm',
}: ContactAvatarProps) => {
  const initial =
    (firstName?.trim()?.charAt(0) || lastName?.trim()?.charAt(0) || '?').toUpperCase()

  if (image) {
    return (
      <img
        src={image}
        alt={`${firstName} ${lastName}`.trim()}
        className={`${sizeClasses[size]} shrink-0 rounded-full object-cover border border-gray-200`}
      />
    )
  }

  return (
    <span
      className={`${sizeClasses[size]} inline-flex shrink-0 items-center justify-center rounded-full bg-blue-600 font-semibold text-white`}
      aria-hidden="true"
    >
      {initial}
    </span>
  )
}

export default ContactAvatar
