import React from 'react'

interface PageTitleProps {
  title: string
  children?: React.ReactNode
}

const PageTitle = ({ title, children }: PageTitleProps) => {
  return (
    <div className="flex shrink-0 flex-col gap-3 rounded-sm bg-white p-3 mobile:flex-row mobile:items-center mobile:justify-between tablet:p-3.5">
      <h1 className="truncate text-xl font-medium text-gray-900 tablet:text-2xl">
        {title}
      </h1>
      {children ? (
        <div className="flex shrink-0 items-center gap-2">{children}</div>
      ) : null}
    </div>
  )
}

export default PageTitle
