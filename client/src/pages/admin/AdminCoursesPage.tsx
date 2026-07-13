import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import api from '../../services/api'

interface AdminCourse {
  _id: string
  title: string
  slug: string
  status: string
  category: string
  level: string
  instructor: { name: string; email: string }
  enrollmentCount: number
  updatedAt: string
}

export default function AdminCoursesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [courses, setCourses] = useState<AdminCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState('')
  const [activeId, setActiveId] = useState<string | null>(null)

  const statusFilter = searchParams.get('status') || ''

  useEffect(() => {
    setLoading(true)
    api.get(`/courses/admin/all${statusFilter ? `?status=${statusFilter}` : ''}`)
      .then((r) => setCourses(r.data.data.courses))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [statusFilter])

  const handleReview = async (id: string, action: 'approve' | 'reject') => {
    try {
      await api.patch(`/courses/admin/${id}/review`, { action, feedback })
      setCourses((cs) => cs.map((c) => c._id === id ? { ...c, status: action === 'approve' ? 'published' : 'rejected' } : c))
      setActiveId(null)
      setFeedback('')
    } catch {
      // handle error
    }
  }

  const STATUS_BADGE: Record<string, string> = {
    draft: 'bg-bg-surface-alt text-ink-muted',
    pending_review: 'bg-trail-amber/10 text-trail-amber',
    published: 'bg-trail-green/10 text-trail-green',
    rejected: 'bg-error-clay/10 text-error-clay',
  }

  const STATUSES = ['', 'pending_review', 'published', 'draft', 'rejected']

  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="space-y-6"
      >
        <h1 className="font-display text-display-l text-ink-primary">Course management</h1>

        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s || 'all'}
              onClick={() => { const p = new URLSearchParams(); if (s) p.set('status', s); setSearchParams(p) }}
              className={`px-3 py-1.5 rounded-pill text-small border transition-colors ${
                s === statusFilter ? 'border-trail-green text-trail-green bg-trail-green/5' : 'border-border-color text-ink-muted hover:border-trail-green'
              }`}
            >
              {s || 'All'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-20 bg-bg-surface-alt rounded-card animate-pulse" />)}</div>
        ) : courses.length === 0 ? (
          <Card className="p-8 text-center text-ink-muted text-body">No courses match this filter.</Card>
        ) : (
          <div className="space-y-3">
            {courses.map((c) => (
              <Card key={c._id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display text-heading text-ink-primary">{c.title}</h3>
                      <span className={`text-micro font-mono px-2 py-0.5 rounded-pill ${STATUS_BADGE[c.status]}`}>
                        {c.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-small text-ink-muted">{c.instructor?.name} · {c.category} · {c.level}</p>
                    <p className="text-small text-ink-muted">{c.enrollmentCount} enrolled</p>
                  </div>
                  {c.status === 'pending_review' && (
                    <div className="flex gap-2 shrink-0">
                      {activeId === c._id ? (
                        <div className="space-y-2">
                          <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Feedback (optional)"
                            rows={2}
                            className="w-48 px-2 py-1 text-small border border-border-color rounded-btn bg-bg-surface text-ink-primary focus:outline-none focus:border-trail-green"
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleReview(c._id, 'approve')}>Approve</Button>
                            <Button size="sm" variant="secondary" onClick={() => handleReview(c._id, 'reject')}>Reject</Button>
                            <Button size="sm" variant="ghost" onClick={() => setActiveId(null)}>Cancel</Button>
                          </div>
                        </div>
                      ) : (
                        <Button size="sm" variant="secondary" onClick={() => setActiveId(c._id)}>Review</Button>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </motion.div>
    </AppShell>
  )
}
