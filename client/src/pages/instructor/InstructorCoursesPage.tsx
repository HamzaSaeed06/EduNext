import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import AppShell from '../../components/layout/AppShell'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import courseService, { type Course } from '../../services/courseService'

const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-bg-surface-alt text-ink-muted',
  pending_review: 'bg-trail-amber/10 text-trail-amber',
  published: 'bg-trail-green/10 text-trail-green',
  rejected: 'bg-error-clay/10 text-error-clay',
}

export default function InstructorCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    courseService.getInstructorCourses()
      .then((d) => setCourses(d.courses))
      .catch(() => setError('Failed to load courses'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-display-l text-ink-primary mb-1">My courses</h1>
            <p className="text-body text-ink-muted">Manage and publish your trails</p>
          </div>
          <Link to="/instructor/courses/new">
            <Button>Create course</Button>
          </Link>
        </div>

        {error && <p className="text-small text-error-clay">{error}</p>}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1, 2].map((i) => (
              <div key={i} className="h-40 bg-bg-surface-alt rounded-card animate-pulse" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <Card className="p-10 text-center">
            <p className="text-body text-ink-muted mb-4">
              No courses yet. Create your first trail and share your knowledge.
            </p>
            <Link to="/instructor/courses/new">
              <Button>Create your first course</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {courses.map((course, i) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-display text-heading text-ink-primary leading-snug pr-4">{course.title}</h3>
                    <span className={`text-micro font-mono px-2 py-0.5 rounded-pill shrink-0 ${STATUS_BADGE[course.status]}`}>
                      {course.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-small text-ink-muted mb-1">{course.category} · {course.level}</p>
                  <p className="text-small text-ink-muted mb-4">{course.enrollmentCount} enrolled</p>
                  <div className="flex gap-2">
                    <Link to={`/instructor/courses/${course._id}/edit`}>
                      <Button variant="secondary" size="sm">Edit</Button>
                    </Link>
                    {course.status === 'draft' && (
                      <Button size="sm" variant="ghost"
                        onClick={async () => {
                          await courseService.submitCourse(course._id)
                          setCourses((cs) => cs.map((c) => c._id === course._id ? { ...c, status: 'pending_review' } : c))
                        }}
                      >
                        Submit for review
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </AppShell>
  )
}
