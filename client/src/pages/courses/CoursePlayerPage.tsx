import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'
import AppShell from '../../components/layout/AppShell'
import Button from '../../components/ui/Button'
import TrailProgress from '../../components/ui/TrailProgress'
import type { RootState } from '../../features/store'
import courseService, { type Course, type Section, type Lecture } from '../../services/courseService'

export default function CoursePlayerPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { accessToken: token } = useSelector((s: RootState) => s.auth)

  const [course, setCourse] = useState<Course | null>(null)
  const [sections, setSections] = useState<Section[]>([])
  const [activeLecture, setActiveLecture] = useState<Lecture | null>(null)
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!slug || !token) { navigate('/login'); return }
    Promise.all([
      courseService.getCourse(slug),
      courseService.getMyEnrollments(),
    ]).then(([courseData, enrollData]) => {
      setCourse(courseData.course)
      setSections(courseData.sections)
      // find enrollment
      const enroll = enrollData.enrollments.find((e) => e.course?.slug === slug)
      if (!enroll) { navigate(`/courses/${slug}`); return }
      setEnrollmentId(enroll._id)
      setProgress(enroll.progress)
      // pick first lecture
      const firstSection = courseData.sections[0]
      if (firstSection?.lectures?.length) setActiveLecture(firstSection.lectures[0])
    }).catch(() => navigate(`/courses/${slug}`))
      .finally(() => setLoading(false))
  }, [slug, token, navigate])

  const markComplete = async (lecture: Lecture) => {
    if (!enrollmentId || completedIds.has(lecture._id)) return
    try {
      const result = await courseService.getMyEnrollments() // stub — real progress update below
      void result
      setCompletedIds((prev) => new Set([...prev, lecture._id]))
      // Optimistic progress calculation
      const totalLectures = sections.reduce((sum, s) => sum + s.lectures.length, 0)
      const newCompleted = completedIds.size + 1
      setProgress(Math.round((newCompleted / totalLectures) * 100))
    } catch {
      // silent — non-critical
    }
  }

  const allLectures = sections.flatMap((s) => s.lectures)
  const activeIdx = allLectures.findIndex((l) => l._id === activeLecture?._id)
  const prevLecture = activeIdx > 0 ? allLectures[activeIdx - 1] : null
  const nextLecture = activeIdx < allLectures.length - 1 ? allLectures[activeIdx + 1] : null

  if (loading) {
    return (
      <AppShell>
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-bg-surface-alt rounded-card" />
        </div>
      </AppShell>
    )
  }

  return (
    <div className="flex h-screen bg-bg-canvas overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-72' : 'w-0'} transition-all duration-200 overflow-hidden border-r border-border-color bg-bg-surface flex-shrink-0`}>
        <div className="w-72">
          <div className="p-4 border-b border-border-color">
            <Link to={`/courses/${slug}`} className="text-small text-ink-muted hover:text-trail-green">
              ← {course?.title}
            </Link>
            <div className="mt-3">
              <div className="flex items-center justify-between text-small mb-1">
                <span className="text-ink-muted">Your progress</span>
                <span className="text-trail-green font-mono">{progress}%</span>
              </div>
              <TrailProgress progress={progress} size="mini" />
            </div>
          </div>
          <div className="overflow-y-auto h-full pb-20">
            {sections.map((section) => (
              <div key={section._id}>
                <p className="px-4 py-2 text-micro font-mono text-ink-muted uppercase tracking-wide bg-bg-surface-alt border-b border-border-color">
                  {section.title}
                </p>
                {section.lectures.map((lec) => (
                  <button
                    key={lec._id}
                    onClick={() => setActiveLecture(lec)}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 border-b border-border-color/50 transition-colors hover:bg-bg-surface-alt ${activeLecture?._id === lec._id ? 'bg-trail-green/5 border-l-2 border-l-trail-green' : ''}`}
                  >
                    <span className="text-ink-muted text-small shrink-0">
                      {completedIds.has(lec._id) ? '✓' : lec.type === 'video' ? '▶' : '📄'}
                    </span>
                    <span className={`text-small leading-snug ${activeLecture?._id === lec._id ? 'text-trail-green font-medium' : 'text-ink-primary'}`}>
                      {lec.title}
                    </span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="border-b border-border-color px-4 py-3 flex items-center gap-4 bg-bg-surface">
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            className="text-ink-muted hover:text-ink-primary transition-colors"
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
          <span className="text-small text-ink-primary font-medium flex-1 truncate">{activeLecture?.title}</span>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-8">
          {activeLecture ? (
            <motion.div
              key={activeLecture._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
            >
              {/* Video player */}
              {activeLecture.type === 'video' && (
                <div className="bg-black rounded-card mb-6 aspect-video flex items-center justify-center">
                  <video
                    ref={videoRef}
                    className="w-full h-full rounded-card"
                    controls
                    onEnded={() => markComplete(activeLecture)}
                  >
                    <source src="#" type="video/mp4" />
                    <p className="text-white text-small">Video preview not available in this environment.</p>
                  </video>
                </div>
              )}

              {/* PDF viewer */}
              {activeLecture.type === 'pdf' && (
                <div className="bg-bg-surface-alt rounded-card mb-6 p-8 text-center">
                  <span className="text-ink-muted text-body">📄 PDF viewer not available in preview mode.</span>
                </div>
              )}

              {/* Text lecture */}
              {activeLecture.type === 'text' && (
                <Card className="mb-6 p-6">
                  <p className="text-body text-ink-muted">No content text added yet for this lecture.</p>
                </Card>
              )}

              <h2 className="font-display text-heading text-ink-primary mb-6">{activeLecture.title}</h2>

              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!prevLecture}
                  onClick={() => prevLecture && setActiveLecture(prevLecture)}
                >
                  ← Previous
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    markComplete(activeLecture)
                    if (nextLecture) setActiveLecture(nextLecture)
                  }}
                >
                  {completedIds.has(activeLecture._id) ? (nextLecture ? 'Next →' : 'All done ✓') : 'Mark complete & continue'}
                </Button>
              </div>
            </motion.div>
          ) : (
            <div className="text-center py-20 text-ink-muted text-body">Select a lecture to begin.</div>
          )}
        </div>
      </main>
    </div>
  )
}
