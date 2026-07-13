import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import AppShell from '../../components/layout/AppShell'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import courseService, { type Course, type Section } from '../../services/courseService'
import api from '../../services/api'

export default function CourseEditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [course, setCourse] = useState<Course | null>(null)
  const [sections, setSections] = useState<Section[]>([])
  const [form, setForm] = useState({ title: '', description: '', category: '', level: '' })
  const [newSectionTitle, setNewSectionTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState<'info' | 'curriculum'>('info')

  useEffect(() => {
    if (!id) return
    // Load instructor's courses and find this one
    courseService.getInstructorCourses().then((data) => {
      const c = data.courses.find((c) => c._id === id)
      if (!c) { navigate('/instructor/courses'); return }
      setCourse(c)
      setForm({ title: c.title, description: c.description, category: c.category, level: c.level })
    }).catch(() => navigate('/instructor/courses'))
      .finally(() => setLoading(false))

    // Load sections
    api.get(`/courses/${id}/sections-editor`).catch(() => {})
  }, [id, navigate])

  const handleSave = async () => {
    if (!id) return
    setSaving(true)
    setError('')
    try {
      const { course: updated } = await courseService.updateCourse(id, form)
      setCourse(updated)
      setSuccess('Changes saved')
      setTimeout(() => setSuccess(''), 2000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleAddSection = async () => {
    if (!newSectionTitle.trim() || !id) return
    try {
      const res = await api.post(`/courses/${id}/sections`, { title: newSectionTitle, order: sections.length })
      setSections((prev) => [...prev, res.data.data.section])
      setNewSectionTitle('')
    } catch {
      setError('Failed to add section')
    }
  }

  const handleSubmit = async () => {
    if (!id) return
    try {
      await courseService.submitCourse(id)
      navigate('/instructor/courses')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit')
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-bg-surface-alt rounded w-64" />
          <div className="h-64 bg-bg-surface-alt rounded-card" />
        </div>
      </AppShell>
    )
  }

  if (!course) return null

  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="max-w-3xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-display-l text-ink-primary">{course.title}</h1>
            <span className={`text-micro font-mono px-2 py-0.5 rounded-pill mt-1 inline-block ${
              course.status === 'published' ? 'bg-trail-green/10 text-trail-green' :
              course.status === 'pending_review' ? 'bg-trail-amber/10 text-trail-amber' :
              'bg-bg-surface-alt text-ink-muted'
            }`}>
              {course.status.replace('_', ' ')}
            </span>
          </div>
          <div className="flex gap-2">
            {course.status === 'draft' && (
              <Button variant="secondary" onClick={handleSubmit}>Submit for review</Button>
            )}
            <Button onClick={() => navigate('/instructor/courses')} variant="ghost">Done</Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-border-color">
          {(['info', 'curriculum'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-small font-medium capitalize transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? 'border-trail-green text-trail-green'
                  : 'border-transparent text-ink-muted hover:text-ink-primary'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {error && <div className="text-error-clay text-small mb-4">{error}</div>}
        {success && <div className="text-trail-green text-small mb-4">{success}</div>}

        {activeTab === 'info' && (
          <Card className="p-6 space-y-5">
            <Input label="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            <div>
              <label className="text-small font-medium text-ink-primary mb-1 block">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={5}
                className="w-full px-3 py-2 rounded-btn border border-border-color bg-bg-surface text-body text-ink-primary focus:outline-none focus:border-trail-green focus:ring-1 focus:ring-trail-green"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Category" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
              <div>
                <label className="text-small font-medium text-ink-primary mb-1 block">Level</label>
                <select
                  value={form.level}
                  onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}
                  className="w-full px-3 py-2 rounded-btn border border-border-color bg-bg-surface text-body focus:outline-none focus:border-trail-green"
                >
                  {['Beginner', 'Intermediate', 'Advanced'].map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>
            <Button onClick={handleSave} isLoading={saving}>Save changes</Button>
          </Card>
        )}

        {activeTab === 'curriculum' && (
          <div className="space-y-4">
            {sections.length === 0 && (
              <Card className="p-6 text-center text-ink-muted text-body">
                No sections yet. Add your first section below.
              </Card>
            )}
            {sections.map((s) => (
              <Card key={s._id} className="p-4">
                <h3 className="font-display text-heading text-ink-primary mb-2">{s.title}</h3>
                {s.lectures.length === 0 ? (
                  <p className="text-small text-ink-muted">No lectures yet</p>
                ) : (
                  <ul className="space-y-1">
                    {s.lectures.map((l) => (
                      <li key={l._id} className="text-small text-ink-muted flex items-center gap-2">
                        <span>{l.type === 'video' ? '▶' : '📄'}</span>
                        <span>{l.title}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            ))}
            <Card className="p-4">
              <div className="flex gap-3">
                <input
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddSection() }}
                  placeholder="New section title…"
                  className="flex-1 px-3 py-2 rounded-btn border border-border-color bg-bg-surface text-body text-ink-primary focus:outline-none focus:border-trail-green"
                />
                <Button onClick={handleAddSection} variant="secondary" size="sm">Add section</Button>
              </div>
            </Card>
          </div>
        )}
      </motion.div>
    </AppShell>
  )
}
