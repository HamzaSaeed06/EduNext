import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import PublicNavbar from '../components/layout/PublicNavbar'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import TrailProgress from '../components/ui/TrailProgress'
import {
  GlobeIcon,
  ChartBarIcon,
  PaletteIcon,
  RobotIcon,
  BriefcaseIcon,
  MegaphoneIcon,
  CodeIcon,
  LockIcon,
  MapIcon,
  BookOpenIcon,
  TrophyIcon,
  StarIcon,
  CheckIcon,
} from '../components/ui/Icons'
import api from '../services/api'
import type { SVGProps } from 'react'

type IconComponent = (props: SVGProps<SVGSVGElement>) => JSX.Element

interface PlatformStats {
  activeUsers: number
  coursesAvailable: number
  totalEnrollments: number
  averageRating: number
}

const sampleCourses = [
  { id: 1, title: 'Introduction to Machine Learning', instructor: 'Dr. Sarah Chen', level: 'Beginner', progress: 45, enrolled: 2340 },
  { id: 2, title: 'Advanced React Patterns', instructor: 'James Okafor', level: 'Advanced', progress: 0, enrolled: 1890 },
  { id: 3, title: 'System Design Fundamentals', instructor: 'Priya Nair', level: 'Intermediate', progress: 72, enrolled: 3100 },
]

const CATEGORIES: { label: string; icon: IconComponent; count: number }[] = [
  { label: 'Web Development', icon: GlobeIcon, count: 48 },
  { label: 'Data Science', icon: ChartBarIcon, count: 34 },
  { label: 'Design & UX', icon: PaletteIcon, count: 27 },
  { label: 'Machine Learning', icon: RobotIcon, count: 31 },
  { label: 'Business', icon: BriefcaseIcon, count: 22 },
  { label: 'Marketing', icon: MegaphoneIcon, count: 19 },
  { label: 'Programming', icon: CodeIcon, count: 56 },
  { label: 'Cybersecurity', icon: LockIcon, count: 15 },
]

const INSTRUCTORS = [
  { name: 'Dr. Sarah Chen', title: 'ML Researcher & Educator', courses: 12, students: 24000, initials: 'SC', color: 'bg-trail-green' },
  { name: 'James Okafor', title: 'Senior Frontend Engineer', courses: 8, students: 18500, initials: 'JO', color: 'bg-signal-blue' },
  { name: 'Priya Nair', title: 'System Design Expert', courses: 6, students: 31000, initials: 'PN', color: 'bg-trail-amber' },
  { name: 'Carlos Mendes', title: 'Cybersecurity Specialist', courses: 9, students: 14200, initials: 'CM', color: 'bg-error-clay' },
]

const TESTIMONIALS = [
  {
    name: 'Aisha Rahman', role: 'Software Engineer at Stripe', initials: 'AR',
    text: 'EduNext completely changed how I approach learning. The trail system keeps me motivated and the AI tutor is genuinely helpful when I get stuck.',
    rating: 5,
  },
  {
    name: 'Marco Diaz', role: 'Data Analyst at Spotify', initials: 'MD',
    text: 'Finished the Data Science trail in 6 weeks. The certificate got me a 30% salary increase. Worth every minute.',
    rating: 5,
  },
  {
    name: 'Yuna Park', role: 'UX Designer at Figma', initials: 'YP',
    text: 'I\'ve tried Coursera, Udemy, and Skillshare. EduNext is the only platform where I actually complete courses.',
    rating: 5,
  },
]

const FAQS = [
  { q: 'Is EduNext free?', a: 'Yes — creating an account and accessing course previews is completely free. Full course access requires enrollment.' },
  { q: 'How long does a course take?', a: 'Most trails are designed for 4–8 weeks at 3–5 hours per week, but you can go at your own pace. Your progress is always saved.' },
  { q: 'Are the certificates recognized?', a: 'EduNext certificates are verifiable via a unique link. Each certificate includes the course, issue date, and your name — shareable on LinkedIn.' },
  { q: 'Can I access courses on mobile?', a: 'Yes. EduNext is fully responsive and works on any device.' },
  { q: 'What if I get stuck in a course?', a: 'Every course has an AI Tutor and a Q&A discussion board where you can ask questions and get answers from other learners.' },
  { q: 'How do instructors join?', a: 'Instructors are verified and onboarded by our team. If you\'re an expert who wants to teach, contact us.' },
]

const HOW_IT_WORKS: { step: string; title: string; desc: string; icon: IconComponent }[] = [
  { step: '01', title: 'Pick a trail', desc: 'Browse 200+ courses across every discipline. Filter by level, category, or rating to find the perfect fit.', icon: MapIcon },
  { step: '02', title: 'Learn at your pace', desc: 'Watch videos, complete quizzes, and ask your AI Tutor when you get stuck. Your progress saves automatically.', icon: BookOpenIcon },
  { step: '03', title: 'Earn your certificate', desc: 'Complete a trail and receive a verified certificate with a unique link — shareable directly on LinkedIn.', icon: TrophyIcon },
]

export default function HomePage() {
  const navigate = useNavigate()
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [stats, setStats] = useState<PlatformStats | null>(null)

  useEffect(() => {
    api.get('/platform/stats')
      .then((r) => setStats(r.data.data))
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-bg-base font-body">
      <PublicNavbar />

      {/* ── Hero ── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h1 className="font-display text-display-l text-ink-primary mb-4 leading-tight">
            Learning is a trail, not a finish line.
          </h1>
          <p className="text-body text-ink-muted mb-8 max-w-xl mx-auto">
            Video courses, AI-powered guidance, and a progress system that shows
            you exactly where you are on every trail you walk.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link to="/courses">
              <Button size="lg">Browse courses</Button>
            </Link>
            <Button
              variant="secondary" size="lg"
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            >
              How it works
            </Button>
          </div>
        </motion.div>
      </section>

      {/* ── Stats bar ── */}
      <section className="border-y border-border-color bg-bg-surface py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: stats?.activeUsers.toLocaleString() || '12,000+', label: 'Active learners' },
              { value: stats?.coursesAvailable.toLocaleString() || '200+', label: 'Courses available' },
              { value: stats?.totalEnrollments.toLocaleString() || '—', label: 'Total enrollments' },
              { value: stats?.averageRating || '4.8', label: 'Average rating' },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="font-display text-display-l text-trail-green font-bold flex items-center justify-center gap-1">
                  {value}
                  {label === 'Average rating' && (
                    <StarIcon className="w-5 h-5 text-trail-amber inline-block" />
                  )}
                </p>
                <p className="text-small text-ink-muted mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Popular Trails ── */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-heading text-ink-primary">Popular trails</h2>
          <Link to="/courses" className="text-small text-trail-green hover:underline font-medium">View all →</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleCourses.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
            >
              <Card hover className="p-5 cursor-pointer" onClick={() => navigate('/courses')}>
                <div className="flex items-start justify-between mb-3">
                  <span className="text-micro font-mono text-ink-muted uppercase tracking-wide bg-bg-surface-alt px-2 py-0.5 rounded-pill">
                    {course.level}
                  </span>
                  {course.progress > 0 && (
                    <span className="text-micro font-mono text-trail-green">{course.progress}%</span>
                  )}
                </div>
                <h3 className="font-display text-heading leading-snug text-ink-primary mb-1">{course.title}</h3>
                <p className="text-small text-ink-muted mb-4">{course.instructor}</p>
                <TrailProgress progress={course.progress} size="mini" className="mb-4" />
                <div className="flex items-center justify-between">
                  <span className="text-small text-ink-muted">{course.enrolled.toLocaleString()} enrolled</span>
                  <Button size="sm" variant={course.progress > 0 ? 'secondary' : 'primary'}
                    onClick={(e) => { e.stopPropagation(); navigate('/courses') }}>
                    {course.progress > 0 ? 'Continue trail' : 'Start course'}
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="bg-bg-surface border-y border-border-color py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-display text-heading text-ink-primary mb-2">Explore by category</h2>
          <p className="text-body text-ink-muted mb-8">Find the trail that matches your goals.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {CATEGORIES.map((cat, i) => (
              <motion.button
                key={cat.label}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, delay: i * 0.03 }}
                onClick={() => navigate(`/courses?search=${cat.label.toLowerCase()}`)}
                className="flex flex-col items-start gap-2 p-4 bg-bg-base border border-border-color rounded-card hover:border-trail-green hover:shadow-card transition-all text-left group"
              >
                <cat.icon className="w-6 h-6 text-ink-muted group-hover:text-trail-green transition-colors" />
                <span className="text-small font-medium text-ink-primary group-hover:text-trail-green transition-colors">{cat.label}</span>
                <span className="text-micro text-ink-muted">{cat.count} courses</span>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="py-20 max-w-7xl mx-auto px-6">
        <h2 className="font-display text-display-l text-ink-primary text-center mb-3">How it works</h2>
        <p className="text-body text-ink-muted text-center mb-12 max-w-lg mx-auto">Three steps from zero to certified.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {HOW_IT_WORKS.map(({ step, title, desc, icon: Icon }) => (
            <div key={step} className="text-center relative">
              <div className="w-16 h-16 rounded-full bg-trail-green/10 border-2 border-trail-green/20 flex items-center justify-center mx-auto mb-4">
                <Icon className="w-7 h-7 text-trail-green" />
              </div>
              <span className="text-micro font-mono text-trail-green/60 uppercase tracking-widest">{step}</span>
              <h3 className="font-display text-heading text-ink-primary mt-1 mb-3">{title}</h3>
              <p className="text-body text-ink-muted">{desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link to="/register">
            <Button size="lg">Create free account</Button>
          </Link>
        </div>
      </section>

      {/* ── Featured Instructors ── */}
      <section className="bg-bg-surface border-y border-border-color py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-display text-heading text-ink-primary mb-2">Learn from the best</h2>
          <p className="text-body text-ink-muted mb-8">Our instructors are industry practitioners with real-world experience.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {INSTRUCTORS.map((ins, i) => (
              <motion.div
                key={ins.name}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, delay: i * 0.05 }}
              >
                <Card className="p-5 text-center">
                  <div className={`w-14 h-14 rounded-full ${ins.color} text-white flex items-center justify-center font-display font-bold text-heading mx-auto mb-3`}>
                    {ins.initials}
                  </div>
                  <h3 className="font-display text-heading text-ink-primary mb-1">{ins.name}</h3>
                  <p className="text-micro text-ink-muted mb-3">{ins.title}</p>
                  <div className="flex justify-center gap-4 text-center">
                    <div>
                      <p className="font-display font-bold text-ink-primary text-small">{ins.courses}</p>
                      <p className="text-micro text-ink-muted">Courses</p>
                    </div>
                    <div className="w-px bg-border-color" />
                    <div>
                      <p className="font-display font-bold text-ink-primary text-small">{(ins.students / 1000).toFixed(1)}k</p>
                      <p className="text-micro text-ink-muted">Students</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Tutor CTA ── */}
      <section className="bg-signal-blue text-white py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-pill px-3 py-1 text-small mb-4">
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 1a7 7 0 1 1 0 14A7 7 0 0 1 8 1zm0 1.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11zM8 5a1 1 0 0 1 1 1v3a1 1 0 0 1-2 0V6a1 1 0 0 1 1-1zm0 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
            </svg>
            AI Tutor — included in every course
          </div>
          <h2 className="font-display text-display-l mb-4">Stuck? Ask your AI Tutor.</h2>
          <p className="text-body text-white/80 max-w-lg mx-auto mb-6">
            Every course comes with an AI tutor that understands your position in the material and gives you contextual help — not generic answers.
          </p>
          <Link to="/register">
            <Button variant="secondary" size="lg" className="!bg-white !text-signal-blue hover:!opacity-90">
              Try the AI Tutor free
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <h2 className="font-display text-heading text-ink-primary mb-2 text-center">What learners say</h2>
        <p className="text-body text-ink-muted text-center mb-10">Real results from real learners.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15, delay: i * 0.07 }}
            >
              <Card className="p-6 h-full flex flex-col">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <StarIcon key={j} className="w-4 h-4 text-trail-amber" />
                  ))}
                </div>
                <p className="text-body text-ink-primary mb-5 flex-1 italic">"{t.text}"</p>
                <div className="flex items-center gap-3 border-t border-border-color pt-4">
                  <div className="w-9 h-9 rounded-full bg-trail-green/20 text-trail-green flex items-center justify-center font-display font-bold text-small shrink-0">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-small font-medium text-ink-primary">{t.name}</p>
                    <p className="text-micro text-ink-muted">{t.role}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Certificate Preview ── */}
      <section className="bg-bg-surface border-y border-border-color py-16">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <span className="text-micro font-mono text-trail-green uppercase tracking-widest">Verified certificates</span>
            <h2 className="font-display text-display-l text-ink-primary mt-2 mb-4">Your achievement, verified.</h2>
            <p className="text-body text-ink-muted mb-6">
              Every completed trail earns you a certificate with a unique verification link. Share it on LinkedIn, add it to your resume, or send it directly to employers.
            </p>
            <ul className="space-y-3 mb-8">
              {['Unique verification URL for each certificate', 'Includes your name, course, and completion date', 'Shareable on LinkedIn with one click', 'Permanently verifiable — never expires'].map((item) => (
                <li key={item} className="flex items-center gap-2 text-small text-ink-muted">
                  <span className="w-5 h-5 rounded-full bg-trail-green/10 text-trail-green flex items-center justify-center shrink-0">
                    <CheckIcon className="w-3 h-3" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <Link to="/register">
              <Button size="lg">Start earning certificates</Button>
            </Link>
          </div>

          {/* Certificate mockup */}
          <div className="flex-1 w-full max-w-md">
            <div className="border-2 border-trail-green/30 rounded-card p-8 bg-bg-base shadow-card relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-trail-green to-trail-amber" />
              <div className="text-center">
                <svg viewBox="0 0 32 32" className="w-10 h-10 mx-auto mb-3" aria-hidden="true">
                  <path d="M8,28 C6,20 14,16 10,8 C14,12 20,10 22,4 C24,14 16,18 20,28" fill="none" stroke="#2F6F4E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="22" cy="4" r="3" fill="#E2A03E" />
                </svg>
                <p className="text-micro font-mono text-ink-muted uppercase tracking-widest mb-1">Certificate of Completion</p>
                <p className="font-display text-heading text-ink-primary mb-1">EduNext</p>
                <div className="border-t border-border-color my-4" />
                <p className="text-small text-ink-muted mb-1">This certifies that</p>
                <p className="font-display text-display-l text-ink-primary mb-1">Your Name Here</p>
                <p className="text-small text-ink-muted mb-3">has successfully completed</p>
                <p className="font-display text-heading text-trail-green mb-4">Introduction to Machine Learning</p>
                <div className="flex justify-between items-center text-micro text-ink-muted border-t border-border-color pt-4">
                  <span>Issued July 2026</span>
                  <span className="font-mono text-trail-green flex items-center gap-1">
                    <CheckIcon className="w-3 h-3" /> Verified
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 max-w-4xl mx-auto px-6">
        <h2 className="font-display text-heading text-ink-primary mb-2 text-center">Frequently asked questions</h2>
        <p className="text-body text-ink-muted text-center mb-10">Everything you need to know.</p>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="border border-border-color rounded-card overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-bg-surface-alt transition-colors"
              >
                <span className="font-medium text-small text-ink-primary">{faq.q}</span>
                <svg
                  className={`w-4 h-4 text-ink-muted transition-transform shrink-0 ml-3 ${openFaq === i ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4 text-small text-ink-muted border-t border-border-color bg-bg-surface">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="bg-trail-green text-white py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-display text-display-l mb-4">Ready to start your trail?</h2>
          <p className="text-body text-white/80 mb-8 max-w-lg mx-auto">
            Join 12,000+ learners already building skills that matter. Free to start, no credit card required.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link to="/register">
              <Button size="lg" className="!bg-white !text-trail-green hover:!opacity-90 font-semibold">
                Create free account
              </Button>
            </Link>
            <Link to="/courses">
              <Button size="lg" variant="ghost" className="!text-white !border-white/40 hover:!bg-white/10">
                Browse courses first
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-bg-surface border-t border-border-color px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-small text-ink-muted">
          <Link to="/" className="font-display font-semibold text-ink-primary">EduNext</Link>
          <div className="flex items-center gap-6 flex-wrap justify-center">
            <Link to="/courses" className="hover:text-trail-green transition-colors">Courses</Link>
            <Link to="/#how-it-works" className="hover:text-trail-green transition-colors">How it works</Link>
            <Link to="/login" className="hover:text-trail-green transition-colors">Sign in</Link>
            <Link to="/register" className="hover:text-trail-green transition-colors">Register</Link>
          </div>
          <span>© 2026 EduNext. Learning is a trail.</span>
        </div>
      </footer>
    </div>
  )
}
