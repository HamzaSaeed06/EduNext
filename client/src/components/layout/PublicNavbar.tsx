import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import Button from '../ui/Button'
import type { RootState } from '../../features/store'
import { clearCredentials } from '../../features/auth/authSlice'
import { setAccessToken } from '../../services/api'
import authService from '../../services/authService'
import {
  GlobeIcon,
  ChartBarIcon,
  PaletteIcon,
  RobotIcon,
  BriefcaseIcon,
  MegaphoneIcon,
  CodeIcon,
  LockIcon,
} from '../ui/Icons'
import type { SVGProps } from 'react'

type IconComponent = (props: SVGProps<SVGSVGElement>) => JSX.Element

const CATEGORIES: { label: string; icon: IconComponent; q: string }[] = [
  { label: 'Web Development', icon: GlobeIcon, q: 'web' },
  { label: 'Data Science', icon: ChartBarIcon, q: 'data' },
  { label: 'Design & UX', icon: PaletteIcon, q: 'design' },
  { label: 'Machine Learning', icon: RobotIcon, q: 'ml' },
  { label: 'Business', icon: BriefcaseIcon, q: 'business' },
  { label: 'Marketing', icon: MegaphoneIcon, q: 'marketing' },
  { label: 'Programming', icon: CodeIcon, q: 'programming' },
  { label: 'Cybersecurity', icon: LockIcon, q: 'security' },
]

export default function PublicNavbar() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user, isAuthenticated } = useSelector((s: RootState) => s.auth)

  const handleLogout = async () => {
    try {
      await authService.logout()
    } catch {
      // ignore — clear local state regardless
    }
    setAccessToken(null)
    dispatch(clearCredentials())
    navigate('/')
  }

  const dashboardPath = user?.role === 'admin' ? '/admin' : user?.role === 'instructor' ? '/instructor/courses' : '/dashboard'

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <nav className="bg-bg-surface border-b border-border-color px-6 py-4 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <svg viewBox="0 0 32 32" className="w-8 h-8" aria-hidden="true">
            <path
              d="M8,28 C6,20 14,16 10,8 C14,12 20,10 22,4 C24,14 16,18 20,28"
              fill="none" stroke="#2F6F4E" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"
            />
            <circle cx="22" cy="4" r="3" fill="#E2A03E" />
          </svg>
          <span className="font-display text-xl font-semibold text-ink-primary">EduNext</span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1">
          {/* Courses dropdown */}
          <div className="relative" ref={ref}>
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-1 px-3 py-2 text-small font-medium text-ink-muted hover:text-ink-primary rounded-btn hover:bg-bg-surface-alt transition-colors"
            >
              Courses
              <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {open && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-bg-surface border border-border-color rounded-card shadow-card py-2 z-50">
                <Link
                  to="/courses"
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2 text-small font-medium text-ink-primary hover:bg-bg-surface-alt transition-colors"
                >
                  Browse all courses →
                </Link>
                <div className="border-t border-border-color my-2" />
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.q}
                    onClick={() => {
                      setOpen(false)
                      navigate(`/courses?search=${cat.q}`)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-small text-ink-muted hover:text-ink-primary hover:bg-bg-surface-alt transition-colors text-left"
                  >
                    <cat.icon className="w-4 h-4 shrink-0" />
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link to="/#how-it-works" className="px-3 py-2 text-small font-medium text-ink-muted hover:text-ink-primary rounded-btn hover:bg-bg-surface-alt transition-colors">
            How it works
          </Link>
        </div>

        {/* Auth buttons */}
        <div className="flex items-center gap-3 shrink-0">
          {isAuthenticated ? (
            <>
              <Link to={dashboardPath}>
                <Button variant="ghost" size="sm">
                  {user?.name ? `Hi, ${user.name.split(' ')[0]}` : 'Dashboard'}
                </Button>
              </Link>
              <Button size="sm" onClick={handleLogout}>Sign out</Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Start learning</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
