import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import courseService, { type Course } from '../../services/courseService'

const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced']
const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most popular' },
  { value: 'rating', label: 'Top rated' },
]

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [level, setLevel] = useState('')
  const [sort, setSort] = useState<'newest' | 'popular' | 'rating'>('newest')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchCourses = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await courseService.getCourses({ page, level: level || undefined, sort, search: search || undefined })
      setCourses(data.courses)
      setTotal(data.pagination.total)
    } catch {
      setError('Failed to load courses. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [page, level, sort, search])

  useEffect(() => { fetchCourses() }, [fetchCourses])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchCourses()
  }

  return (
    <div className="min-h-screen bg-bg-base font-body">
      {/* Public Navbar */}
      <nav className="bg-bg-surface border-b border-border-color px-6 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <svg viewBox="0 0 32 32" className="w-8 h-8" aria-hidden="true">
              <path
                d="M8,28 C6,20 14,16 10,8 C14,12 20,10 22,4 C24,14 16,18 20,28"
                fill="none"
                stroke="#2F6F4E"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="22" cy="4" r="3" fill="#E2A03E" />
            </svg>
            <span className="font-display text-xl font-semibold text-ink-primary">EduNext</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link to="/register">
              <Button size="sm">Start learning</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          <div>
            <h1 className="font-display text-display-l text-ink-primary mb-2">All courses</h1>
            <p className="text-body text-ink-muted">
              {total > 0 ? `${total} trail${total === 1 ? '' : 's'} available` : 'Browse trails across every discipline'}
            </p>
          </div>

          {/* Search + sort */}
          <div className="flex flex-wrap gap-3 items-center">
            <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[220px]">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search courses…"
                className="flex-1 px-3 py-2 rounded-btn border border-border-color bg-bg-surface text-body text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-trail-green focus:ring-1 focus:ring-trail-green text-small"
              />
              <Button type="submit" size="sm" variant="secondary">Search</Button>
            </form>
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value as typeof sort); setPage(1) }}
              className="px-3 py-2 rounded-btn border border-border-color bg-bg-surface text-small text-ink-primary focus:outline-none focus:border-trail-green"
            >
              {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          {/* Level filters */}
          <div className="flex flex-wrap gap-2">
            {LEVELS.map((l) => (
              <button
                key={l}
                onClick={() => { setLevel(l === 'All' ? '' : l); setPage(1) }}
                className={`px-3 py-1.5 rounded-pill text-small border transition-colors ${
                  (l === 'All' && !level) || l === level
                    ? 'border-trail-green text-trail-green bg-trail-green/5'
                    : 'border-border-color text-ink-muted hover:border-trail-green hover:text-trail-green'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {error && (
            <div className="bg-error-clay/10 border border-error-clay/30 text-error-clay text-small px-4 py-3 rounded-btn">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 bg-bg-surface-alt rounded-card animate-pulse" />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <Card className="p-10 text-center">
              <p className="text-heading text-ink-muted mb-2">No courses found</p>
              <p className="text-small text-ink-muted">Try different keywords or remove filters.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {courses.map((course, i) => (
                <motion.div
                  key={course._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.04 }}
                >
                  <Card hover className="p-5 h-full flex flex-col">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} className="w-full h-32 object-cover rounded-btn mb-3" />
                    ) : (
                      <div className="w-full h-32 bg-bg-surface-alt rounded-btn mb-3 flex items-center justify-center">
                        <span className="text-ink-muted text-display-l">🎓</span>
                      </div>
                    )}
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-micro font-mono text-ink-muted uppercase tracking-wide bg-bg-surface-alt px-2 py-0.5 rounded-pill">
                        {course.level}
                      </span>
                      {course.averageRating > 0 && (
                        <span className="text-micro font-mono text-trail-amber">★ {course.averageRating.toFixed(1)}</span>
                      )}
                    </div>
                    <h3 className="font-display text-heading leading-snug text-ink-primary mb-1 flex-1">
                      {course.title}
                    </h3>
                    <p className="text-small text-ink-muted mb-1">{course.instructor?.name}</p>
                    <p className="text-micro text-ink-muted mb-4">{course.category}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-small text-ink-muted">{course.enrollmentCount.toLocaleString()} enrolled</span>
                      <Link to={`/courses/${course.slug}`}>
                        <Button size="sm">View course</Button>
                      </Link>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {total > 12 && (
            <div className="flex justify-center gap-2 pt-4">
              <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <span className="text-small text-ink-muted py-2">Page {page}</span>
              <Button variant="ghost" size="sm" disabled={courses.length < 12} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          )}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border-color px-6 py-6 mt-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-small text-ink-muted flex-wrap gap-3">
          <Link to="/" className="font-display font-semibold text-ink-primary">EduNext</Link>
          <span>© 2026 EduNext. Learning is a trail.</span>
        </div>
      </footer>
    </div>
  )
}
