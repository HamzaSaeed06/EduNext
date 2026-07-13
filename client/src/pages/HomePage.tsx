import { motion } from 'framer-motion'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import TrailProgress from '../components/ui/TrailProgress'

const sampleCourses = [
  { id: 1, title: 'Introduction to Machine Learning', instructor: 'Dr. Sarah Chen', level: 'Beginner', progress: 45, enrolled: 2340 },
  { id: 2, title: 'Advanced React Patterns', instructor: 'James Okafor', level: 'Advanced', progress: 0, enrolled: 1890 },
  { id: 3, title: 'System Design Fundamentals', instructor: 'Priya Nair', level: 'Intermediate', progress: 72, enrolled: 3100 },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-bg-base font-body">
      <nav className="bg-bg-surface border-b border-border-color px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
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
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm">Sign in</Button>
            <Button size="sm">Start learning</Button>
          </div>
        </div>
      </nav>

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
            <Button size="lg">Browse courses</Button>
            <Button variant="secondary" size="lg">How it works</Button>
          </div>
        </motion.div>
      </section>

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
              <Card hover className="p-5">
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
                  <Button size="sm" variant={course.progress > 0 ? 'secondary' : 'primary'}>
                    {course.progress > 0 ? 'Continue trail' : 'Start course'}
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

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
          <Button variant="secondary" size="lg" className="!bg-white !text-signal-blue hover:!bg-opacity-90">
            Try the AI Tutor
          </Button>
        </div>
      </section>

      <footer className="bg-bg-surface border-t border-border-color px-6 py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-small text-ink-muted">
          <span className="font-display font-semibold text-ink-primary">EduNext</span>
          <span>© 2026 EduNext. Learning is a trail.</span>
        </div>
      </footer>
    </div>
  )
}
