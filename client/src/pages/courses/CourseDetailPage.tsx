import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'
import AppShell from '../../components/layout/AppShell'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import TrailProgress from '../../components/ui/TrailProgress'
import ReviewsSection from '../../components/courses/ReviewsSection'
import { PlayCircleIcon, DocumentIcon, NoteIcon, BookOpenIcon, TicketFreeIcon, UsersIcon, StarIcon, CheckIcon, TrophyIcon } from '../../components/ui/Icons'
import type { RootState } from '../../features/store'
import courseService, { type Course, type Section, type Lecture } from '../../services/courseService'
import { getErrorMessage } from '../../services/api'

export default function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { user, accessToken: token } = useSelector((s: RootState) => s.auth)

  const [course, setCourse] = useState<Course | null>(null)
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [enrolled, setEnrolled] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [claimingCertificate, setClaimingCertificate] = useState(false)
  const [error, setError] = useState('')

  const fetchCourseDetails = () => {
    if (!slug) return
    courseService.getCourse(slug)
      .then((d) => {
        setCourse(d.course)
        setSections(d.sections)
        if (token) {
          courseService.getMyEnrollments()
            .then((res) => {
              const enrollment = res.enrollments.find((e) => e.course._id === d.course._id)
              setEnrolled(!!enrollment)
              if (enrollment) {
                setProgress(enrollment.progress)
                setIsCompleted(enrollment.isCompleted)
                const done = new Set<string>()
                ;(enrollment.completedLectures || []).forEach((lp) => {
                  if (lp.completed) done.add(lp.lecture)
                })
                setCompletedIds(done)
              }
            })
            .catch(console.error)
        }
      })
      .catch(() => setError('Course not found'))
      .finally(() => setLoading(false))
  }

  const handleClaimCertificate = async () => {
    if (!slug) return
    setClaimingCertificate(true)
    try {
      await courseService.issueCertificate(slug)
      navigate('/my-certificates')
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to claim certificate'))
    } finally {
      setClaimingCertificate(false)
    }
  }

  useEffect(() => {
    fetchCourseDetails()
  }, [slug, token])

  const handleEnroll = async () => {
    if (!token) { navigate('/login'); return }
    setEnrolling(true)
    try {
      await courseService.enrollCourse(slug!)
      setEnrolled(true)
      navigate(`/courses/${slug}/learn`)
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to enroll'))
    } finally {
      setEnrolling(false)
    }
  }

  const totalLectures = sections.reduce((sum: number, s: Section) => sum + s.lectures.length, 0)
  const freeLectures = sections.reduce((sum: number, s: Section) => sum + s.lectures.filter((l: Lecture) => l.isFree).length, 0)

  if (loading) {
    return (
      <AppShell>
        <div className="max-w-4xl space-y-4 animate-pulse">
          <div className="h-8 bg-bg-surface-alt rounded-btn w-32" />
          <div className="h-12 bg-bg-surface-alt rounded-btn w-2/3" />
          <div className="h-4 bg-bg-surface-alt rounded-btn w-full" />
        </div>
      </AppShell>
    )
  }

  if (error || !course) {
    return (
      <AppShell>
        <div className="text-center py-20">
          <p className="text-body text-ink-muted mb-4">{error || 'Course not found'}</p>
          <Link to="/courses"><Button variant="secondary">Back to courses</Button></Link>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="max-w-4xl"
      >
        <Link to="/courses" className="text-small text-ink-muted hover:text-trail-green flex items-center gap-1 mb-6">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          All courses
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left: info */}
          <div className="md:col-span-2">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-micro font-mono text-ink-muted uppercase tracking-wide bg-bg-surface-alt px-2 py-0.5 rounded-pill">
                {course.level}
              </span>
              <span className="text-micro font-mono text-ink-muted bg-bg-surface-alt px-2 py-0.5 rounded-pill">
                {course.category}
              </span>
            </div>
            <h1 className="font-display text-display-l text-ink-primary mb-3 leading-tight">{course.title}</h1>
            <p className="text-body text-ink-muted mb-4">{course.description}</p>
            <p className="text-small text-ink-muted mb-6">By <span className="text-ink-primary font-medium">{course.instructor?.name}</span></p>

            <div className="flex flex-wrap gap-4 text-small text-ink-muted mb-8">
              <span className="inline-flex items-center gap-1.5"><BookOpenIcon className="w-4 h-4" /> {totalLectures} lectures</span>
              {freeLectures > 0 && <span className="inline-flex items-center gap-1.5"><TicketFreeIcon className="w-4 h-4" /> {freeLectures} free previews</span>}
              <span className="inline-flex items-center gap-1.5"><UsersIcon className="w-4 h-4" /> {course.enrollmentCount.toLocaleString()} enrolled</span>
              {course.averageRating > 0 && <span className="inline-flex items-center gap-1.5"><StarIcon className="w-4 h-4 text-trail-amber" /> {course.averageRating.toFixed(1)} rating</span>}
            </div>

            {/* Progress tracker — same visual language as the course player
                sidebar, so enrolled students can see where they stand
                without opening a lecture. */}
            {enrolled && (
              <Card className="p-4 mb-6">
                <div className="flex items-center justify-between text-small mb-1.5">
                  <span className="text-ink-muted">Your progress</span>
                  <span className="text-trail-green font-mono text-micro">{progress}%</span>
                </div>
                <TrailProgress
                  progress={progress}
                  size="mini"
                  completedCount={completedIds.size}
                  totalCount={totalLectures}
                />
                <p className="text-micro text-ink-muted mt-1.5">{completedIds.size}/{totalLectures} lectures done</p>

                {isCompleted && (
                  <div className="mt-4 pt-4 border-t border-border-color flex items-center justify-between gap-3 flex-wrap">
                    <span className="inline-flex items-center gap-2 text-small font-medium text-trail-green">
                      <TrophyIcon className="w-5 h-5" /> Course completed
                    </span>
                    <Button size="sm" isLoading={claimingCertificate} onClick={handleClaimCertificate}>
                      Get certificate
                    </Button>
                  </div>
                )}
              </Card>
            )}

            {/* Curriculum */}
            {sections.length > 0 && (
              <section>
                <h2 className="font-display text-heading text-ink-primary mb-4">Curriculum</h2>
                <div className="space-y-3">
                  {sections.map((section: Section) => (
                    <Card key={section._id} className="p-4">
                      <h3 className="font-display text-subheading text-ink-primary mb-2">{section.title}</h3>
                      <ul className="space-y-1">
                        {section.lectures.map((lec: Lecture) => {
                          const isDone = completedIds.has(lec._id)
                          const TypeIcon = lec.type === 'video' ? PlayCircleIcon : lec.type === 'pdf' ? DocumentIcon : NoteIcon
                          return (
                            <li key={lec._id} className="flex items-center gap-2 text-small text-ink-muted">
                              {isDone ? (
                                <CheckIcon className="w-4 h-4 text-trail-green shrink-0" />
                              ) : (
                                <TypeIcon className="w-4 h-4 shrink-0" />
                              )}
                              <span className={isDone ? 'text-ink-muted' : ''}>{lec.title}</span>
                              {lec.isFree && <span className="text-micro text-trail-green bg-trail-green/10 px-1.5 rounded-pill">Free</span>}
                              {lec.duration > 0 && <span className="ml-auto">{Math.round(lec.duration / 60)}m</span>}
                            </li>
                          )
                        })}
                      </ul>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Reviews Section */}
            <ReviewsSection slug={slug!} enrolled={enrolled} courseId={course._id} />
          </div>

          {/* Right: enroll card */}
          <div>
            <Card className="p-6 sticky top-24">
              {course.thumbnail && (
                <img src={course.thumbnail} alt={course.title} className="w-full h-36 object-cover rounded-btn mb-4" />
              )}
              <p className="font-display text-display-s text-ink-primary mb-4">Free</p>
              {enrolled ? (
                <Button size="lg" className="w-full" onClick={() => navigate(`/courses/${slug}/learn`)}>
                  Continue learning
                </Button>
              ) : (
                <Button size="lg" className="w-full" isLoading={enrolling} onClick={handleEnroll}>
                  {user ? 'Enroll now' : 'Sign in to enroll'}
                </Button>
              )}
              <p className="text-micro text-ink-muted text-center mt-3">Full access · No payment required</p>
            </Card>
          </div>
        </div>
      </motion.div>
    </AppShell>
  )
}

