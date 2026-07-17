import type { ReactNode } from 'react'

type StatWidgetProps = {
  title: string
  value: number | string
  subtitle: string
  icon: ReactNode
  accentClass: string
  iconClass: string
}

const StatWidget = ({
  title,
  value,
  subtitle,
  icon,
  accentClass,
  iconClass,
}: StatWidgetProps) => {
  return (
    <div className="flex min-h-[108px] flex-col justify-between rounded-sm bg-app-surface p-3 shadow-sm tablet:min-h-[120px] tablet:p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wide text-app-text-muted tablet:text-xs">
            {title}
          </p>
          <p className="mt-1.5 truncate text-2xl font-semibold text-app-text tablet:mt-2 tablet:text-3xl">
            {value}
          </p>
        </div>
        <span
          className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg tablet:h-11 tablet:w-11 ${accentClass} ${iconClass}`}
        >
          {icon}
        </span>
      </div>
      <p className="mt-2 text-[11px] text-app-text-muted tablet:mt-3 tablet:text-xs">
        {subtitle}
      </p>
    </div>
  )
}

export default StatWidget
