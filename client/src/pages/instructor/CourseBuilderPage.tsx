import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import AppShell from '../../components/layout/AppShell'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import courseService from '../../services/courseService'

const CATEGORIES = ['Web Dev', 'Data Science', 'DevOps', 'Design', 'Engineering', 'Business', 'Other']
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'] as const

export default function CourseBuilderPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    level: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced',
    tags: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { course } = await courseService.createCourse({
        title: form.title,
        description: form.description,
        category: form.category,
        level: form.level,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      })
      navigate(`/instructor/courses/${course._id}/edit`, { replace: true })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create course')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="max-w-2xl"
      >
        <h1 className="font-display text-display-l text-ink-primary mb-2">Create a new course</h1>
        <p className="text-body text-ink-muted mb-8">Fill in the basics — you can add sections and lectures after creation.</p>

        <div className="bg-bg-surface rounded-card shadow-card border border-border-color p-8">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {error && (
              <div className="bg-error-clay/10 border border-error-clay/30 text-error-clay text-small px-4 py-3 rounded-btn" role="alert">
                {error}
              </div>
            )}
            <Input
              label="Course title"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              hint="Be specific — 'Advanced TypeScript Patterns' beats 'TypeScript'"
              required
            />
            <div>
              <label className="text-small font-medium text-ink-primary mb-1 block">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                rows={5}
                className="w-full px-3 py-2 rounded-btn border border-border-color bg-bg-surface text-body text-ink-primary font-body placeholder:text-ink-muted focus:outline-none focus:border-trail-green focus:ring-1 focus:ring-trail-green"
                placeholder="What will students learn? What should they know before starting?"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-small font-medium text-ink-primary mb-1 block">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => set('category', e.target.value)}
                  className="w-full px-3 py-2 rounded-btn border border-border-color bg-bg-surface text-body text-ink-primary focus:outline-none focus:border-trail-green focus:ring-1 focus:ring-trail-green"
                  required
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-small font-medium text-ink-primary mb-1 block">Level</label>
                <select
                  value={form.level}
                  onChange={(e) => set('level', e.target.value as typeof form.level)}
                  className="w-full px-3 py-2 rounded-btn border border-border-color bg-bg-surface text-body text-ink-primary focus:outline-none focus:border-trail-green focus:ring-1 focus:ring-trail-green"
                >
                  {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <Input
              label="Tags (comma-separated)"
              value={form.tags}
              onChange={(e) => set('tags', e.target.value)}
              hint="e.g. react, hooks, typescript"
            />
            <div className="flex gap-3 pt-2">
              <Button type="submit" size="lg" isLoading={loading}>Create course</Button>
              <Button type="button" variant="ghost" size="lg" onClick={() => navigate(-1)}>Cancel</Button>
            </div>
          </form>
        </div>
      </motion.div>
    </AppShell>
  )
}
