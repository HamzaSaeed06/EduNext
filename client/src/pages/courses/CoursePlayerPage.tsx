import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'
import AppShell from '../../components/layout/AppShell'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import TrailProgress from '../../components/ui/TrailProgress'
import DiscussionPanel from '../../components/ui/DiscussionPanel'
import AIChatWidget from '../../components/ui/AIChatWidget'
import type { RootState } from '../../features/store'
import courseService, { type Course, type Section, type Lecture, type LectureProgress } from '../../services/courseService'

type Tab = 'content' | 'discussion'

export default function CoursePlayerPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { accessToken: token, user } = useSelector((s: RootState) => s.auth)

  const [course, setCourse] = useState<Course | null>(null)
  const [sections, setSections] = useState<Section[]>([])
  const [activeLecture, setActiveLecture] = useState<Lecture | null>(null)
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [lecturePositions, setLecturePositions] = useState<Map<string, number>>(new Map())
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('content')
  const [markingComplete, setMarkingComplete] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const savePositionTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!slug || !token) { navigate('/login'); return }
    Promise.all([
      courseService.getCourse(slug),
      courseService.getMyEnrollments(),
    ]).then(([courseData, enrollData]) => {
      setCourse(courseData.course)
      setSections(courseData.sections)

      const enroll = enrollData.enrollments.find((e) => e.course?.slug === slug)
      if (!enroll) { navigate(`/courses/${slug}`); return }

      setEnrollmentId(enroll._id)
      setProgress(enroll.progress)

      const completed = new Set<string>()
      const positions = new Map<string, number>()
      ;(enroll.completedLectures || []).forEach((lp: LectureProgress) => {
        if (lp.completed) completed.add(lp.lecture)
        if (lp.lastPosition > 0) positions.set(lp.lecture, lp.lastPosition)
      })
      setCompletedIds(completed)
      setLecturePositions(positions)

      // Resume at first incomplete lecture
      const allLectures = courseData.sections.flatMap((s) => s.lectures)
      const firstIncomplete = allLectures.find((l) => !completed.has(l._id)) ?? allLectures[0]
      if (firstIncomplete) setActiveLecture(firstIncomplete)
    }).catch(() => navigate(`/courses/${slug}`))
      .finally(() => setLoading(false))
  }, [slug, token, navigate])

  // Resume video position when switching lectures
  useEffect(() => {
    if (!activeLecture || activeLecture.type !== 'video') return
    const savedPos = lecturePositions.get(activeLecture._id) ?? 0
    if (videoRef.current && savedPos > 0) {
      videoRef.current.currentTime = savedPos
    }
  }, [activeLecture, lecturePositions])

  // Debounced position save
  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current || !enrollmentId || !activeLecture) return
    const currentTime = videoRef.current.currentTime
    if (currentTime < 2) return
    if (savePositionTimer.current) clearTimeout(savePositionTimer.current)
    savePositionTimer.current = setTimeout(() => {
      courseService.updateProgress(enrollmentId, {
        lectureId: activeLecture._id,
        lastPosition: Math.floor(currentTime),
        watchedSeconds: Math.floor(currentTime),
      }).catch(() => {})
    }, 5000)
  }, [enrollmentId, activeLecture])

  const markComplete = useCallback(async (lecture: Lecture) => {
    if (!enrollmentId || completedIds.has(lecture._id) || markingComplete) return
    setMarkingComplete(true)
    try {
      const result = await courseService.updateProgress(enrollmentId, {
        lectureId: lecture._id,
        completed: true,
        lastPosition: videoRef.current ? Math.floor(videoRef.current.currentTime) : 0,
      })
      setCompletedIds((prev) => new Set([...prev, lecture._id]))
      setProgress(result.progress)
    } catch {
      // non-critical: optimistic update already looks good
    } finally {
      setMarkingComplete(false)
    }
  }, [enrollmentId, completedIds, markingComplete])

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
    <div className="flex h-screen bg-bg-base overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? 'w-72' : 'w-0'} transition-all duration-200 overflow-hidden border-r border-border-color bg-bg-surface flex-shrink-0`}
        aria-label="Course curriculum"
      >
        <div className="w-72">
          <div className="p-4 border-b border-border-color">
            <Link to={`/courses/${slug}`} className="text-small text-ink-muted hover:text-trail-green flex items-center gap-1">
              ← {course?.title}
            </Link>
            <div className="mt-3">
              <div className="flex items-center justify-between text-small mb-1">
                <span className="text-ink-muted">Progress</span>
                <span className="text-trail-green font-mono text-micro">{progress}%</span>
              </div>
              <TrailProgress progress={progress} size="mini" />
            </div>
          </div>
          <div className="overflow-y-auto" style={{ height: 'calc(100vh - 132px)' }}>
            {sections.map((section) => (
              <div key={section._id}>
                <p className="px-4 py-2 text-micro font-mono text-ink-muted uppercase tracking-wide bg-bg-surface-alt border-b border-border-color">
                  {section.title}
                </p>
                {section.lectures.map((lec) => {
                  const isActive = activeLecture?._id === lec._id
                  const isDone = completedIds.has(lec._id)
                  return (
                    <button
                      key={lec._id}
                      onClick={() => setActiveLecture(lec)}
                      className={`w-full text-left px-4 py-3 flex items-center gap-3 border-b border-border-color/50 transition-colors hover:bg-bg-surface-alt focus:outline-none focus:bg-bg-surface-alt ${isActive ? 'bg-trail-green/5 border-l-2 border-l-trail-green' : ''}`}
                      aria-current={isActive ? 'true' : undefined}
                    >
                      <span className={`text-small shrink-0 ${isDone ? 'text-trail-green' : 'text-ink-muted'}`} aria-hidden="true">
                        {isDone ? '✓' : lec.type === 'video' ? '▶' : lec.type === 'quiz' ? '❓' : '📄'}
                      </span>
                      <span className={`text-small leading-snug ${isActive ? 'text-trail-green font-medium' : 'text-ink-primary'}`}>
                        {lec.title}
                      </span>
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto flex flex-col" role="main">
        {/* Top bar */}
        <div className="border-b border-border-color px-4 py-3 flex items-center gap-4 bg-bg-surface shrink-0">
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            className="text-ink-muted hover:text-ink-primary transition-colors focus:outline-none focus:ring-2 focus:ring-trail-green rounded"
            aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </button>
          <span className="text-small text-ink-primary font-medium flex-1 truncate">{activeLecture?.title}</span>
          {progress === 100 && (
            <Link to={`/courses/${slug}`}>
              <Button size="sm">Get certificate →</Button>
            </Link>
          )}
        </div>

        <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-6">
          {activeLecture ? (
            <motion.div
              key={activeLecture._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
            >
              {/* Tabs */}
              <div className="flex gap-1 border-b border-border-color mb-6">
                {(['content', 'discussion'] as Tab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 text-small font-medium capitalize border-b-2 -mb-px transition-colors ${
                      activeTab === tab
                        ? 'border-trail-green text-trail-green'
                        : 'border-transparent text-ink-muted hover:text-ink-primary'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {activeTab === 'content' && (
                <div>
                  {/* Video player */}
                  {activeLecture.type === 'video' && (
                    <div className="bg-black rounded-card mb-6 aspect-video overflow-hidden">
                      <video
                        ref={videoRef}
                        className="w-full h-full"
                        controls
                        onEnded={() => markComplete(activeLecture)}
                        onTimeUpdate={handleTimeUpdate}
                        aria-label={activeLecture.title}
                      >
                        {activeLecture.contentUrl && (
                          <source src={activeLecture.contentUrl} type="video/mp4" />
                        )}
                        <track kind="captions" label="Captions" default />
                        <p className="text-white text-small p-4">
                          Your browser doesn't support HTML5 video. Upload a video file to watch here.
                        </p>
                      </video>
                    </div>
                  )}

                  {/* PDF viewer */}
                  {activeLecture.type === 'pdf' && activeLecture.contentUrl && (
                    <div className="bg-bg-surface-alt rounded-card mb-6 p-8 text-center">
                      <p className="text-body text-ink-muted mb-4">📄 PDF document</p>
                      <a
                        href={activeLecture.contentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="secondary">Open PDF</Button>
                      </a>
                    </div>
                  )}

                  {/* Text lecture */}
                  {activeLecture.type === 'text' && (
                    <Card className="mb-6 p-6">
                      <p className="text-body text-ink-muted">No content added yet for this lecture.</p>
                    </Card>
                  )}

                  <h2 className="font-display text-heading text-ink-primary mb-6">{activeLecture.title}</h2>

                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={!prevLecture}
                      onClick={() => { if (prevLecture) setActiveLecture(prevLecture) }}
                    >
                      ← Previous
                    </Button>
                    <Button
                      size="sm"
                      isLoading={markingComplete}
                      onClick={() => {
                        if (!completedIds.has(activeLecture._id)) {
                          markComplete(activeLecture)
                        }
                        if (nextLecture) setActiveLecture(nextLecture)
                      }}
                    >
                      {completedIds.has(activeLecture._id)
                        ? nextLecture ? 'Next →' : 'All done ✓'
                        : 'Mark complete & continue'}
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === 'discussion' && course && (
                <DiscussionPanel
                  courseId={course._id}
                  lectureId={activeLecture._id}
                  courseSlug={slug ?? ''}
                />
              )}
            </motion.div>
          ) : (
            <div className="text-center py-20 text-ink-muted text-body">Select a lecture to begin.</div>
          )}
        </div>
      </main>

      {/* AI Chat Widget — only for enrolled students */}
      {course && user && (
        <AIChatWidget
          courseId={course._id}
          lectureId={activeLecture?._id}
        />
      )}
    </div>
  )
}
