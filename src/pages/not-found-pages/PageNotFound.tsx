import { Link } from 'react-router-dom'

const PageNotFound = () => {
  return (
    <div className="flex h-full min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
      <h1 className="text-4xl font-bold text-blue-600">404</h1>
      <p className="text-lg font-medium text-gray-800">Page Not Found</p>
      <p className="text-sm text-gray-500">
        The page you are looking for does not exist.
      </p>
      <Link
        to="/"
        className="mt-2 text-sm font-medium text-blue-600 hover:underline"
      >
        Go to Dashboard
      </Link>
    </div>
  )
}

export default PageNotFound
