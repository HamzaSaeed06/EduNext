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

const navItems = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    roles: ['student', 'instructor', 'admin'],
  },
  {
    label: 'Courses',
    to: '/courses',
    icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    roles: ['student', 'instructor', 'admin'],
  },
  {
    label: 'Certificates',
    to: '/my-certificates',
    icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
    roles: ['student'],
  },
  {
    label: 'My Courses',
    to: '/instructor/courses',
    icon: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z',
    roles: ['instructor', 'admin'],
  },
  {
    label: 'Analytics',
    to: '/instructor/analytics',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    roles: ['instructor', 'admin'],
  },
  {
    label: 'Admin',
    to: '/admin',
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    roles: ['admin'],
  },
]

interface AppShellProps { children: ReactNode }

export default function AppShell({ children }: AppShellProps) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useSelector((s: RootState) => s.auth)
  const { mode: themeMode } = useSelector((s: RootState) => s.theme)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleLogout = async () => {
    await authService.logout().catch(() => {})
    setAccessToken(null)
    dispatch(clearCredentials())
    navigate('/')
  }

  const visibleNav = navItems.filter((n) => !user || n.roles.includes(user.role))

  return (
    <div className="flex min-h-screen bg-bg-base dark:bg-bg-base-dark">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? 'w-56' : 'w-16'} transition-all duration-200 bg-bg-surface dark:bg-bg-surface-dark border-r border-border-color flex flex-col shrink-0`}
        aria-label="Application navigation"
      >
        <div className="flex items-center gap-2 px-4 py-5 border-b border-border-color">
          <Link to="/" className="flex items-center gap-2 min-w-0">
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

        <nav className="flex-1 py-4 px-2 space-y-1" aria-label="Main navigation">
          {visibleNav.map((item) => {
            const active = location.pathname.startsWith(item.to)
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
          {/* Notifications */}
          <NotificationBell collapsed={!sidebarOpen} />

          {/* Dark mode toggle */}
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

          {/* Sign out */}
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
        </div>
      </aside>

      {/* Main content */}
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
