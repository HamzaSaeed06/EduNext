import { ReactNode, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { setCredentials } from '../../features/auth/authSlice'
import { setAccessToken } from '../../services/api'
import authService from '../../services/authService'
import LoadingSpinner from '../ui/LoadingSpinner'

/**
 * Restores the session from the httpOnly refresh cookie on first load
 * so role-based navigation is correct after a page refresh.
 */
export default function AuthInitializer({ children }: { children: ReactNode }) {
  const dispatch = useDispatch()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    authService
      .refreshToken()
      .then(({ accessToken }) => {
        setAccessToken(accessToken)
        return authService.getMe().then((user) => ({ user, accessToken }))
      })
      .then(({ user, accessToken }) => {
        dispatch(setCredentials({ user, accessToken }))
      })
      .catch(() => {
        setAccessToken(null)
      })
      .finally(() => setReady(true))
  }, [dispatch])

  if (!ready) return <LoadingSpinner />
  return <>{children}</>
}
