import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { RootState } from '../../features/store'
import AppShell from '../../components/layout/AppShell'
import TrailProgress from '../../components/ui/TrailProgress'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import courseService from '../../services/courseService'
import api from '../../services/api'
import { MedalIcon } from '../../components/ui/Icons'

interface Enrollment {
  _id: string
  course: {
    _id: string
    title: string
    slug: string
    thumbnail?: string
    level: string
    instructor?: { name: string }
  }
  progress: number
  isCompleted: boolean
}

interface Recommendation {
  topics: string[]
  reason: string
}

export default function DashboardPage() {
  const { user } = useSelector((s: RootState) => s.auth)
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      courseService.getMyEnrollments().then((d) => setEnrollments(d.enrollments as unknown as Enrollment[])).catch(() => {}),
      user?.role === 'student'
        ? api.get('/ai/recommendations').then((r) => setRecommendations(r.data.data.recommendations)).catch(() => {})
        : Promise.resolve(),
    ]).finally(() => setLoading(false))
  }, [user])

  const inProgress = enrollments.filter((e) => !e.isCompleted)
  const completed = enrollments.filter((e) => e.isCompleted)

  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="space-y-8"
      >
        <div>
          <h1 className="font-display text-display-l text-ink-primary mb-1">
            Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-body text-ink-muted">Pick up where you left off.</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Enrolled', value: enrollments.length },
            { label: 'In progress', value: inProgress.length },
            { label: 'Completed', value: completed.length },
          ].map((s) => (
            <Card key={s.label} className="p-4 text-center">
              <p className="font-display text-display-s text-trail-green">{s.value}</p>
              <p className="text-small text-ink-muted">{s.label}</p>
            </Card>
          ))}
        </div>

        {/* Your Trails */}
        <section>
          <h2 className="font-display text-heading text-ink-primary mb-4">Your trails</h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[1, 2].map((i) => <div key={i} className="h-36 bg-bg-surface-alt rounded-card animate-pulse" />)}
            </div>
          ) : inProgress.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-body text-ink-muted mb-4">No trails started yet — browse courses to begin.</p>
              <Link to="/courses"><Button>Browse courses</Button></Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {inProgress.map((enrollment) => (
                <Card key={enrollment._id} hover className="p-5">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-display text-heading leading-snug text-ink-primary pr-4">
                      {enrollment.course?.title}
                    </h3>
                    <span className="text-micro font-mono text-trail-green shrink-0">{enrollment.progress}%</span>
                  </div>
                  <p className="text-small text-ink-muted mb-4">
                    {enrollment.course?.level} · {enrollment.course?.instructor?.name}
                  </p>
                  <TrailProgress progress={enrollment.progress} size="mini" className="mb-4" />
                  <Link to={`/courses/${enrollment.course?.slug}/learn`}>
                    <Button size="sm">Continue trail</Button>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Completed courses */}
        {completed.length > 0 && (
          <section>
            <h2 className="font-display text-heading text-ink-primary mb-4">Completed trails</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completed.map((enrollment) => (
                <Card key={enrollment._id} className="p-4 flex items-center gap-4">
                  <MedalIcon className="w-5 h-5 shrink-0 text-trail-amber" />
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-heading text-ink-primary truncate">{enrollment.course?.title}</p>
                    <p className="text-small text-trail-green">Completed</p>
                  </div>
                  <Link to={`/courses/${enrollment.course?.slug}`}>
                    <Button size="sm" variant="ghost">View</Button>
                  </Link>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* AI Recommendations */}
        {user?.role === 'student' && (
          <section>
            <div className="inline-flex items-center gap-2 bg-signal-blue/10 text-signal-blue rounded-pill px-3 py-1 text-small mb-3">
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M8 1a7 7 0 1 1 0 14A7 7 0 0 1 8 1z" opacity=".2"/>
                <path d="M8 4a1 1 0 0 1 1 1v3a1 1 0 0 1-2 0V5a1 1 0 0 1 1-1zm0 7a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
              </svg>
              AI Recommendations
            </div>
            <h2 className="font-display text-heading text-ink-primary mb-4">Suggested for you</h2>
            <Card className="p-6 border-signal-blue/20 bg-signal-blue/5">
              {recommendations ? (
                <div>
                  <p className="text-body text-ink-muted mb-3">{recommendations.reason}</p>
                  <div className="flex flex-wrap gap-2">
                    {recommendations.topics.map((t) => (
                      <Link key={t} to={`/courses?category=${encodeURIComponent(t)}`}>
                        <span className="text-small bg-signal-blue/10 text-signal-blue px-3 py-1 rounded-pill hover:bg-signal-blue/20 transition-colors cursor-pointer">
                          {t}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-body text-ink-muted">
                  Complete more courses to unlock personalised AI recommendations.
                </p>
              )}
            </Card>
          </section>
        )}
      </motion.div>
    </AppShell>
  )
}
