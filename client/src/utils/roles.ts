export type UserRole = 'student' | 'instructor' | 'admin'

export function getRoleHome(role: UserRole): string {
  switch (role) {
    case 'admin':
      return '/admin'
    case 'instructor':
      return '/instructor/courses'
    default:
      return '/dashboard'
  }
}

export function hasRole(
  userRole: UserRole | undefined,
  allowed: UserRole[],
): boolean {
  return Boolean(userRole && allowed.includes(userRole))
}

export function roleLabel(role: UserRole): string {
  switch (role) {
    case 'admin':
      return 'Admin'
    case 'instructor':
      return 'Instructor'
    default:
      return 'Student'
  }
}
