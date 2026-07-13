import { useState } from 'react'
import { motion } from 'framer-motion'
import AppShell from '../../components/layout/AppShell'
import Card from '../../components/ui/Card'

export default function AdminUsersPage() {
  const [search, setSearch] = useState('')

  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="space-y-6"
      >
        <h1 className="font-display text-display-l text-ink-primary">User management</h1>
        <div className="flex gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name or email…"
            className="flex-1 px-3 py-2 rounded-btn border border-border-color bg-bg-surface text-body text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-trail-green focus:ring-1 focus:ring-trail-green text-small"
          />
        </div>
        <Card className="p-8 text-center">
          <p className="text-body text-ink-muted mb-2">User list requires a live MongoDB connection.</p>
          <p className="text-small text-ink-muted">Connect a database to populate this page.</p>
        </Card>
      </motion.div>
    </AppShell>
  )
}
