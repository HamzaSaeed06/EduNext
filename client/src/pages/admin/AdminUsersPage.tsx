import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import AppShell from '../../components/layout/AppShell'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import api from '../../services/api'

interface AdminUser {
  _id: string
  name: string
  email: string
  role: 'student' | 'instructor' | 'admin'
  isEmailVerified: boolean
  isBanned: boolean
  lastActive: string
  createdAt: string
}

const ROLES = ['', 'student', 'instructor', 'admin']

const ROLE_BADGE: Record<string, string> = {
  student: 'bg-bg-surface-alt text-ink-muted',
  instructor: 'bg-trail-amber/10 text-trail-amber',
  admin: 'bg-signal-blue/10 text-signal-blue',
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ page: String(page) })
      if (search) params.set('search', search)
      if (role) params.set('role', role)
      const res = await api.get(`/admin/users?${params.toString()}`)
      setUsers(res.data.data.users)
      setTotal(res.data.data.pagination.total)
    } catch {
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [page, search, role])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchUsers()
  }

  const handleBan = async (userId: string) => {
    setActionLoading(userId)
    try {
      const res = await api.patch(`/admin/users/${userId}/ban`)
      setUsers((us) => us.map((u) => u._id === userId ? { ...u, isBanned: res.data.data.isBanned } : u))
    } catch {
      setError('Failed to update user')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    setActionLoading(userId + newRole)
    try {
      const res = await api.patch(`/admin/users/${userId}/role`, { role: newRole })
      setUsers((us) => us.map((u) => u._id === userId ? { ...u, role: res.data.data.role } : u))
    } catch {
      setError('Failed to update role')
    } finally {
      setActionLoading(null)
    }
  }

  const timeAgo = (iso: string) => {
    const d = new Date(iso)
    const diff = Math.floor((Date.now() - d.getTime()) / 1000 / 60 / 60 / 24)
    if (diff === 0) return 'today'
    if (diff === 1) return '1 day ago'
    if (diff < 30) return `${diff} days ago`
    return d.toLocaleDateString()
  }

  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="space-y-6"
      >
        <div>
          <h1 className="font-display text-display-l text-ink-primary mb-1">User management</h1>
          <p className="text-body text-ink-muted">{total > 0 ? `${total} users` : 'Manage platform users'}</p>
        </div>

        {/* Filters */}
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="flex-1 min-w-[200px] px-3 py-2 rounded-btn border border-border-color bg-bg-surface text-body text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-trail-green focus:ring-1 focus:ring-trail-green text-small"
          />
          <select
            value={role}
            onChange={(e) => { setRole(e.target.value); setPage(1) }}
            className="px-3 py-2 rounded-btn border border-border-color bg-bg-surface text-small text-ink-primary focus:outline-none focus:border-trail-green"
          >
            {ROLES.map((r) => <option key={r} value={r}>{r || 'All roles'}</option>)}
          </select>
          <Button type="submit" size="sm" variant="secondary">Search</Button>
        </form>

        {error && (
          <div className="bg-error-clay/10 border border-error-clay/30 text-error-clay text-small px-4 py-3 rounded-btn">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-20 bg-bg-surface-alt rounded-card animate-pulse" />)}
          </div>
        ) : users.length === 0 ? (
          <Card className="p-8 text-center text-ink-muted text-body">No users match your search.</Card>
        ) : (
          <div className="space-y-2">
            {users.map((u) => (
              <Card key={u._id} className={`p-4 ${u.isBanned ? 'opacity-60 border-error-clay/30' : ''}`}>
                <div className="flex items-center gap-4 flex-wrap">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-trail-green/10 flex items-center justify-center text-trail-green font-medium text-small shrink-0">
                    {u.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-small font-medium text-ink-primary">{u.name}</span>
                      <span className={`text-micro px-2 py-0.5 rounded-pill font-mono ${ROLE_BADGE[u.role]}`}>{u.role}</span>
                      {u.isBanned && <span className="text-micro px-2 py-0.5 rounded-pill bg-error-clay/10 text-error-clay">Banned</span>}
                      {!u.isEmailVerified && <span className="text-micro text-ink-muted">Unverified</span>}
                    </div>
                    <p className="text-micro text-ink-muted">{u.email} · Active {timeAgo(u.lastActive)}</p>
                  </div>

                  {/* Actions */}
                  {u.role !== 'admin' && (
                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      {/* Role change */}
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        disabled={actionLoading !== null}
                        className="px-2 py-1 rounded-btn border border-border-color bg-bg-surface text-micro text-ink-primary focus:outline-none focus:border-trail-green disabled:opacity-50"
                        aria-label={`Change role for ${u.name}`}
                      >
                        <option value="student">Student</option>
                        <option value="instructor">Instructor</option>
                      </select>

                      {/* Ban/unban */}
                      <Button
                        size="sm"
                        variant={u.isBanned ? 'secondary' : 'ghost'}
                        isLoading={actionLoading === u._id}
                        onClick={() => handleBan(u._id)}
                      >
                        {u.isBanned ? 'Unban' : 'Ban'}
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > 20 && (
          <div className="flex justify-center gap-2 pt-2">
            <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Previous</Button>
            <span className="text-small text-ink-muted py-2">Page {page}</span>
            <Button variant="ghost" size="sm" disabled={users.length < 20} onClick={() => setPage((p) => p + 1)}>Next →</Button>
          </div>
        )}
      </motion.div>
    </AppShell>
  )
}
