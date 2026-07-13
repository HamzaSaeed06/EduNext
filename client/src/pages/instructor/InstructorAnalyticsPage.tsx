import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AppShell from '../../components/layout/AppShell'
import Card from '../../components/ui/Card'
import courseService, { type Course } from '../../services/courseService'

interface CourseStats {
  course: Course
  enrollments: number
  completions: number
  avgProgress: number
}

export default function InstructorAnalyticsPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    courseService.getInstructorCourses()
      .then((d) => setCourses(d.courses))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const published = courses.filter((c) => c.status === 'published')
  const totalEnrollments = published.reduce((sum, c) => sum + c.enrollmentCount, 0)

  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="space-y-8"
      >
        <div>
          <h1 className="font-display text-display-l text-ink-primary mb-1">Analytics</h1>
          <p className="text-body text-ink-muted">How your trails are performing</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total courses', value: courses.length },
            { label: 'Published', value: published.length },
            { label: 'Total enrollments', value: totalEnrollments },
            { label: 'Pending review', value: courses.filter((c) => c.status === 'pending_review').length },
          ].map((stat) => (
            <Card key={stat.label} className="p-5 text-center">
              <p className="font-display text-display-s text-trail-green">{loading ? '—' : stat.value}</p>
              <p className="text-small text-ink-muted">{stat.label}</p>
            </Card>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-bg-surface-alt rounded-card animate-pulse" />)}
          </div>
        ) : published.length === 0 ? (
          <Card className="p-8 text-center text-ink-muted text-body">
            No published courses yet. Publish a course to see analytics.
          </Card>
        ) : (
          <div>
            <h2 className="font-display text-heading text-ink-primary mb-4">Per-course breakdown</h2>
            <div className="space-y-3">
              {published.map((course) => (
                <Card key={course._id} className="p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-heading text-ink-primary truncate">{course.title}</h3>
                      <p className="text-small text-ink-muted">{course.category} · {course.level}</p>
                    </div>
                    <div className="flex gap-6 text-center shrink-0">
                      <div>
                        <p className="font-display text-heading text-trail-green">{course.enrollmentCount}</p>
                        <p className="text-micro text-ink-muted">Enrolled</p>
                      </div>
                      <div>
                        <p className="font-display text-heading text-trail-amber">{course.averageRating?.toFixed(1) || '—'}</p>
                        <p className="text-micro text-ink-muted">Rating</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </AppShell>
  )
}
