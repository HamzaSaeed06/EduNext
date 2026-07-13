import { ReactNode } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '../../features/store'
import AppShell from './AppShell'
import PublicNavbar from './PublicNavbar'

interface PageLayoutProps {
  children: ReactNode
  /** auto = AppShell when logged in, public navbar when guest */
  variant?: 'auto' | 'public' | 'app'
  /** Extra classes on the public-layout main wrapper */
  className?: string
  /** Skip default public main padding (pages that manage their own) */
  noPadding?: boolean
}

export default function PageLayout({
  children,
  variant = 'auto',
  className = 'min-h-screen bg-bg-base dark:bg-bg-base-dark font-body',
  noPadding = false,
}: PageLayoutProps) {
  const { isAuthenticated } = useSelector((s: RootState) => s.auth)
  const useAppShell = variant === 'app' || (variant === 'auto' && isAuthenticated)

  if (useAppShell) {
    return <AppShell>{children}</AppShell>
  }

  return (
    <div className={className}>
      <PublicNavbar />
      {noPadding ? children : (
        <main className="max-w-7xl mx-auto px-6 py-10" role="main">
          {children}
        </main>
      )}
    </div>
  )
}
