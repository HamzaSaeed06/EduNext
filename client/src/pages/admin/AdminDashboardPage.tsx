import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import AppShell from '../../components/layout/AppShell'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import api from '../../services/api'

interface Stats {
  totalUsers: number
  totalCourses: number
  pendingReview: number
  totalEnrollments: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/stats')
      .then((r) => setStats(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const STAT_CARDS = [
    { label: 'Total users', value: stats?.totalUsers, icon: '👥', href: '/admin/users' },
    { label: 'Total courses', value: stats?.totalCourses, icon: '🎓', href: '/admin/courses' },
    { label: 'Pending review', value: stats?.pendingReview, icon: '⏳', href: '/admin/courses?status=pending_review', highlight: (stats?.pendingReview ?? 0) > 0 },
    { label: 'Enrollments', value: stats?.totalEnrollments, icon: '📈', href: '/admin/courses' },
  ]

  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="space-y-8"
      >
        <div>
          <h1 className="font-display text-display-l text-ink-primary mb-1">Admin dashboard</h1>
          <p className="text-body text-ink-muted">Platform overview and management</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STAT_CARDS.map((stat) => (
            <Link key={stat.label} to={stat.href}>
              <Card hover className={`p-5 ${stat.highlight ? 'border-trail-amber/40 bg-trail-amber/5' : ''}`}>
                <span className="text-2xl">{stat.icon}</span>
                <p className={`font-display text-2xl mt-2 ${stat.highlight ? 'text-trail-amber' : 'text-ink-primary'}`}>
                  {loading ? '—' : (stat.value ?? '—').toLocaleString()}
                </p>
                <p className="text-small text-ink-muted">{stat.label}</p>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="font-display text-heading text-ink-primary mb-4">Quick actions</h2>
            <div className="space-y-2">
              <Link to="/admin/courses?status=pending_review">
                <Button variant="secondary" className="w-full justify-start" size="sm">
                  Review pending courses
                  {(stats?.pendingReview ?? 0) > 0 && (
                    <span className="ml-auto bg-trail-amber text-white text-micro px-2 py-0.5 rounded-pill">
                      {stats!.pendingReview}
                    </span>
                  )}
                </Button>
              </Link>
              <Link to="/admin/users">
                <Button variant="secondary" className="w-full justify-start" size="sm">Manage users</Button>
              </Link>
              <Link to="/admin/courses">
                <Button variant="secondary" className="w-full justify-start" size="sm">All courses</Button>
              </Link>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="font-display text-heading text-ink-primary mb-4">Platform health</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-small text-trail-green">
                <span className="w-2 h-2 rounded-full bg-trail-green" aria-hidden="true" />
                API operational
              </div>
              {!loading && stats && (
                <div className="text-small text-ink-muted space-y-1">
                  <p>{stats.totalUsers.toLocaleString()} registered users</p>
                  <p>{stats.totalEnrollments.toLocaleString()} total enrollments</p>
                  <p>{stats.totalCourses.toLocaleString()} courses on platform</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </motion.div>
    </AppShell>
  )
}
