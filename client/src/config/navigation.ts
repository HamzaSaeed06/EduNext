import type { UserRole } from '../utils/roles'

export interface NavItem {
  label: string
  to: string
  icon: string
  roles: UserRole[]
  /** Match nested routes (e.g. /admin/users highlights Admin) */
  matchPrefix?: string
}

export const sidebarNavItems: NavItem[] = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    roles: ['student', 'instructor', 'admin'],
  },
  {
    label: 'Browse courses',
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
    label: 'My courses',
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
    label: 'Admin overview',
    to: '/admin',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    roles: ['admin'],
    matchPrefix: '/admin',
  },
  {
    label: 'Manage users',
    to: '/admin/users',
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    roles: ['admin'],
  },
  {
    label: 'Manage courses',
    to: '/admin/courses',
    icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
    roles: ['admin'],
  },
]

export interface PublicNavLink {
  label: string
  to: string
  roles: UserRole[]
}

/** Compact links shown in the public top bar when logged in */
export const publicNavLinks: PublicNavLink[] = [
  { label: 'Dashboard', to: '/dashboard', roles: ['student'] },
  { label: 'My courses', to: '/instructor/courses', roles: ['instructor'] },
  { label: 'Admin', to: '/admin', roles: ['admin'] },
  { label: 'Certificates', to: '/my-certificates', roles: ['student'] },
  { label: 'Analytics', to: '/instructor/analytics', roles: ['instructor', 'admin'] },
]

export function getSidebarNavForRole(role: UserRole): NavItem[] {
  return sidebarNavItems.filter((item) => item.roles.includes(role))
}

export function getPublicNavForRole(role: UserRole): PublicNavLink[] {
  return publicNavLinks.filter((item) => item.roles.includes(role))
}

export function isNavItemActive(pathname: string, item: NavItem): boolean {
  const prefix = item.matchPrefix ?? item.to
  if (prefix === '/dashboard') return pathname === '/dashboard'
  return pathname === item.to || pathname.startsWith(`${prefix}/`)
}
