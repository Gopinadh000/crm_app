import React from 'react'

interface MainContainerProps {
  children: React.ReactNode
}

const MainContainer = ({ children }: MainContainerProps) => {
  return (
    <div className="flex min-h-0 w-full flex-1 flex-col overflow-x-hidden overflow-y-auto overscroll-y-contain bg-app-bg p-3 mobile:p-4 tablet:p-5 desktop:p-6 xl:p-7.5">
      <div className="flex min-h-0 w-full flex-1 flex-col">{children}</div>
    </div>
  )
}

export default MainContainer
