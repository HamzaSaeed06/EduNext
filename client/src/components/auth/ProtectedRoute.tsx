import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '../../features/store'

interface Props {
  children: ReactNode
  roles?: ('student' | 'instructor' | 'admin')[]
}

export default function ProtectedRoute({ children, roles }: Props) {
  const { isAuthenticated, user } = useSelector((s: RootState) => s.auth)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
