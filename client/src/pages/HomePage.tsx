import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import TrailProgress from '../components/ui/TrailProgress'

const sampleCourses = [
  { id: 1, title: 'Introduction to Machine Learning', instructor: 'Dr. Sarah Chen', level: 'Beginner', progress: 45, enrolled: 2340 },
  { id: 2, title: 'Advanced React Patterns', instructor: 'James Okafor', level: 'Advanced', progress: 0, enrolled: 1890 },
  { id: 3, title: 'System Design Fundamentals', instructor: 'Priya Nair', level: 'Intermediate', progress: 72, enrolled: 3100 },
]

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-bg-base font-body">
      {/* Nav */}
      <nav className="bg-bg-surface border-b border-border-color px-6 py-4">
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

      {/* Hero */}
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
          <div className="flex gap-3 justify-center">
            <Link to="/courses">
              <Button size="lg">Browse courses</Button>
            </Link>
            <Button variant="secondary" size="lg" onClick={() => {
              document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
            }}>
              How it works
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Popular courses */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <h2 className="font-display text-heading text-ink-primary mb-8">Popular trails</h2>
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
                <h3 className="font-display text-heading leading-snug text-ink-primary mb-1">
                  {course.title}
                </h3>
                <p className="text-small text-ink-muted mb-4">{course.instructor}</p>
                <TrailProgress progress={course.progress} size="mini" className="mb-4" />
                <div className="flex items-center justify-between">
                  <span className="text-small text-ink-muted">
                    {course.enrolled.toLocaleString()} enrolled
                  </span>
                  <Button
                    size="sm"
                    variant={course.progress > 0 ? 'secondary' : 'primary'}
                    onClick={(e) => { e.stopPropagation(); navigate('/courses') }}
                  >
                    {course.progress > 0 ? 'Continue trail' : 'Start course'}
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-bg-surface border-y border-border-color py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-display text-display-l text-ink-primary text-center mb-12">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Pick a trail', desc: 'Browse hundreds of courses across every discipline. Filter by level, category, or rating.' },
              { step: '02', title: 'Learn at your pace', desc: 'Watch videos, read materials, and take quizzes. Your progress is saved automatically.' },
              { step: '03', title: 'Earn a certificate', desc: 'Complete a trail and receive a verified certificate you can share on LinkedIn.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <span className="font-mono text-display-l text-trail-green/20 font-bold">{step}</span>
                <h3 className="font-display text-heading text-ink-primary mt-2 mb-3">{title}</h3>
                <p className="text-body text-ink-muted">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/register">
              <Button size="lg">Create free account</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* AI Tutor CTA */}
      <section className="bg-signal-blue text-white py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-pill px-3 py-1 text-small mb-4">
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 1a7 7 0 1 1 0 14A7 7 0 0 1 8 1zm0 1.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11zM8 5a1 1 0 0 1 1 1v3a1 1 0 0 1-2 0V6a1 1 0 0 1 1-1zm0 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
            </svg>
            AI Tutor
          </div>
          <h2 className="font-display text-display-l mb-4">Stuck? Ask your AI Tutor.</h2>
          <p className="text-body text-white/80 max-w-lg mx-auto mb-6">
            Every course comes with an AI tutor that understands exactly where you are in the material.
          </p>
          <Link to="/register">
            <Button variant="secondary" size="lg" className="!bg-white !text-signal-blue hover:!opacity-90">
              Try the AI Tutor
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-bg-surface border-t border-border-color px-6 py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-small text-ink-muted flex-wrap gap-4">
          <Link to="/" className="font-display font-semibold text-ink-primary">EduNext</Link>
          <div className="flex items-center gap-6">
            <Link to="/courses" className="hover:text-trail-green transition-colors">Courses</Link>
            <Link to="/login" className="hover:text-trail-green transition-colors">Sign in</Link>
            <Link to="/register" className="hover:text-trail-green transition-colors">Register</Link>
          </div>
          <span>© 2026 EduNext. Learning is a trail.</span>
        </div>
      </footer>
    </div>
  )
}
