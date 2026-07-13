import { ReactNode, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import type { RootState } from '../../features/store'
import { clearCredentials } from '../../features/auth/authSlice'
import { toggleTheme } from '../../features/theme/themeSlice'
import { setAccessToken } from '../../services/api'
import authService from '../../services/authService'
import NotificationBell from '../ui/NotificationBell'
import { getSidebarNavForRole, isNavItemActive } from '../../config/navigation'
import { getRoleHome, roleLabel } from '../../utils/roles'

interface AppShellProps { children: ReactNode }

export default function AppShell({ children }: AppShellProps) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated } = useSelector((s: RootState) => s.auth)
  const { mode: themeMode } = useSelector((s: RootState) => s.theme)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleLogout = async () => {
    await authService.logout().catch(() => {})
    setAccessToken(null)
    dispatch(clearCredentials())
    navigate('/')
  }

  const visibleNav = user ? getSidebarNavForRole(user.role) : []

  return (
    <div className="flex min-h-screen bg-bg-base dark:bg-bg-base-dark">
      <aside
        className={`${sidebarOpen ? 'w-56' : 'w-16'} transition-all duration-200 bg-bg-surface dark:bg-bg-surface-dark border-r border-border-color flex flex-col shrink-0`}
        aria-label="Application navigation"
      >
        <div className="flex items-center gap-2 px-4 py-5 border-b border-border-color">
          <Link to={user ? getRoleHome(user.role) : '/'} className="flex items-center gap-2 min-w-0">
            <svg viewBox="0 0 32 32" className="w-7 h-7 shrink-0" aria-hidden="true">
              <path d="M8,28 C6,20 14,16 10,8 C14,12 20,10 22,4 C24,14 16,18 20,28" fill="none" stroke="#2F6F4E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="22" cy="4" r="3" fill="#E2A03E" />
            </svg>
            {sidebarOpen && <span className="font-display font-semibold text-ink-primary dark:text-ink-primary-dark truncate">EduNext</span>}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto p-1 rounded text-ink-muted hover:bg-bg-surface-alt focus:outline-none focus:ring-2 focus:ring-trail-green"
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarOpen ? 'M11 19l-7-7 7-7m8 14l-7-7 7-7' : 'M13 5l7 7-7 7M5 5l7 7-7 7'} />
            </svg>
          </button>
        </div>

        {user && sidebarOpen && (
          <div className="px-4 py-3 border-b border-border-color">
            <p className="text-small font-medium text-ink-primary dark:text-ink-primary-dark truncate">{user.name}</p>
            <p className="text-micro font-mono text-ink-muted truncate">{roleLabel(user.role)}</p>
          </div>
        )}

        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto" aria-label="Main navigation">
          {visibleNav.map((item) => {
            const active = isNavItemActive(location.pathname, item)
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-btn text-small font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-trail-green ${
                  active
                    ? 'bg-trail-green/10 text-trail-green'
                    : 'text-ink-muted hover:bg-bg-surface-alt hover:text-ink-primary dark:hover:text-ink-primary-dark'
                }`}
                title={!sidebarOpen ? item.label : undefined}
                aria-current={active ? 'page' : undefined}
              >
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                </svg>
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-border-color p-3 space-y-1">
          {isAuthenticated && <NotificationBell collapsed={!sidebarOpen} />}

          <button
            onClick={() => dispatch(toggleTheme())}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-btn text-small text-ink-muted hover:bg-bg-surface-alt transition-colors focus:outline-none focus:ring-2 focus:ring-trail-green"
            title={!sidebarOpen ? (themeMode === 'dark' ? 'Light mode' : 'Dark mode') : undefined}
            aria-label={themeMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              {themeMode === 'dark' ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              )}
            </svg>
            {sidebarOpen && <span>{themeMode === 'dark' ? 'Light mode' : 'Dark mode'}</span>}
          </button>

          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-btn text-small text-ink-muted hover:bg-bg-surface-alt hover:text-error-clay transition-colors focus:outline-none focus:ring-2 focus:ring-trail-green"
              title={!sidebarOpen ? 'Sign out' : undefined}
            >
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {sidebarOpen && <span>Sign out</span>}
            </button>
          )}
        </div>
      </aside>

      <main className="flex-1 overflow-auto" role="main">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="max-w-6xl mx-auto px-6 py-8"
        >
          {children}
        </motion.div>
      </main>
    </div>
  )
}
