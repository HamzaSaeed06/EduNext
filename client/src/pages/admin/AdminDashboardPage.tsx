import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

const STAT_CARDS = [
  { label: 'Total users', value: '—', icon: '👥', href: '/admin/users' },
  { label: 'Total courses', value: '—', icon: '🎓', href: '/admin/courses' },
  { label: 'Pending review', value: '—', icon: '⏳', href: '/admin/courses?status=pending_review' },
  { label: 'Enrollments', value: '—', icon: '📈', href: '/admin/courses' },
]

export default function AdminDashboardPage() {
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
              <Card hover className="p-5">
                <span className="text-display-s">{stat.icon}</span>
                <p className="font-display text-display-s text-ink-primary mt-2">{stat.value}</p>
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
                <Button variant="secondary" className="w-full justify-start" size="sm">Review pending courses</Button>
              </Link>
              <Link to="/admin/users">
                <Button variant="secondary" className="w-full justify-start" size="sm">Manage users</Button>
              </Link>
            </div>
          </Card>
          <Card className="p-6">
            <h2 className="font-display text-heading text-ink-primary mb-4">Platform health</h2>
            <div className="flex items-center gap-2 text-small text-trail-green">
              <span className="w-2 h-2 rounded-full bg-trail-green" />
              All systems operational
            </div>
          </Card>
        </div>
      </motion.div>
    </AppShell>
  )
}
