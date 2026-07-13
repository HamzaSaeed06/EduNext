import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import AppShell from '../../components/layout/AppShell'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import courseService, { type Course, type Section } from '../../services/courseService'
import api from '../../services/api'
import { validateVideoFile } from '../../utils/videoUpload'

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

  // Curriculum building state
  const [activeAddLectureSection, setActiveAddLectureSection] = useState<string | null>(null)
  const [newLectureForm, setNewLectureForm] = useState({ title: '', type: 'video' })
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [dragOver, setDragOver] = useState<Record<string, boolean>>({})

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
    api.get(`/courses/${id}/sections-editor`)
      .then((res) => setSections(res.data.data.sections))
      .catch(() => { })
  }, [id, navigate])

  const handleSave = async () => {
    if (!id) return
    setSaving(true)
    setError('')
    try {
      const { course: updated } = await courseService.updateCourse(id, { ...form, level: form.level as Course['level'] })
      setCourse(updated)
      setSuccess('Changes saved')
      setTimeout(() => setSuccess(''), 2000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const reloadSections = async () => {
    if (!id) return
    try {
      const res = await api.get(`/courses/${id}/sections-editor`)
      setSections(res.data.data.sections)
    } catch { }
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

  const handleDeleteSection = async (sectionId: string) => {
    if (!window.confirm('Are you sure you want to delete this section? All its lectures will be orphaned.')) return
    try {
      await api.delete(`/courses/sections/${sectionId}`)
      setSections((prev) => prev.filter((s) => s._id !== sectionId))
      setSuccess('Section deleted')
      setTimeout(() => setSuccess(''), 2000)
    } catch {
      setError('Failed to delete section')
    }
  }

  const handleCreateLecture = async (sectionId: string) => {
    if (!newLectureForm.title.trim()) return
    try {
      const section = sections.find((s) => s._id === sectionId)
      const order = section ? section.lectures.length : 0
      await api.post(`/courses/sections/${sectionId}/lectures`, {
        title: newLectureForm.title,
        type: newLectureForm.type,
        order,
      })
      await reloadSections()
      setActiveAddLectureSection(null)
      setNewLectureForm({ title: '', type: 'video' })
      setSuccess('Lecture created')
      setTimeout(() => setSuccess(''), 2000)
    } catch {
      setError('Failed to create lecture')
    }
  }

  const handleDeleteLecture = async (lectureId: string) => {
    if (!window.confirm('Are you sure you want to delete this lecture?')) return
    try {
      await api.delete(`/courses/lectures/${lectureId}`)
      await reloadSections()
      setSuccess('Lecture deleted')
      setTimeout(() => setSuccess(''), 2000)
    } catch {
      setError('Failed to delete lecture')
    }
  }

  const handleVideoUpload = async (lectureId: string, file: File) => {
    const validation = validateVideoFile(file)
    if (!validation.valid) {
      setError(validation.error!)
      return
    }

    setError('')
    try {
      // Get signed upload URL parameters from backend
      const sigRes = await api.post(`/courses/lectures/${lectureId}/upload-signature`, {
        fileSize: file.size,
        fileType: file.type,
      })
      const { signature, timestamp, apiKey, cloudName, folder } = sigRes.data.data

      setUploadProgress((prev) => ({ ...prev, [lectureId]: 5 }))

      if (signature === 'mock_signature') {
        // Run mock upload sequence for tests/stub env
        for (let p = 10; p <= 100; p += 10) {
          await new Promise((r) => setTimeout(r, 150))
          setUploadProgress((prev) => ({ ...prev, [lectureId]: p }))
        }
        await api.post(`/courses/lectures/${lectureId}/confirm-upload`, {
          url: `https://placeholder.edunext.dev/edunext/video/${Date.now()}.mp4`,
          duration: 180,
        })
      } else {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('api_key', apiKey)
        fd.append('timestamp', String(timestamp))
        fd.append('signature', signature)
        fd.append('folder', folder)

        const uploadRes = await axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, fd, {
          onUploadProgress: (e) => {
            const tot = e.total || file.size
            const pct = Math.round((e.loaded * 100) / tot)
            setUploadProgress((prev) => ({ ...prev, [lectureId]: pct }))
          },
        })

        await api.post(`/courses/lectures/${lectureId}/confirm-upload`, {
          url: uploadRes.data.secure_url,
          duration: Math.round(uploadRes.data.duration || 0),
        })
      }

      setSuccess('Video uploaded successfully!')
      setTimeout(() => setSuccess(''), 2000)
      await reloadSections()
    } catch (err) {
      setError('Video upload failed. Please try again.')
    } finally {
      setUploadProgress((prev) => {
        const next = { ...prev }
        delete next[lectureId]
        return next
      })
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
            <span className={`text-micro font-mono px-2 py-0.5 rounded-pill mt-1 inline-block ${course.status === 'published' ? 'bg-trail-green/10 text-trail-green' :
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
              className={`px-4 py-2 text-small font-medium capitalize transition-colors border-b-2 -mb-px ${activeTab === tab
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
              <Card key={s._id} className="p-5 border border-border-color bg-bg-surface space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-heading-m text-ink-primary font-semibold">{s.title}</h3>
                  <Button size="sm" variant="ghost" onClick={() => handleDeleteSection(s._id)} className="text-error-clay">
                    Delete Section
                  </Button>
                </div>

                <div className="space-y-3 pl-4 border-l-2 border-border-color">
                  {s.lectures.length === 0 ? (
                    <p className="text-small text-ink-muted py-2">No lectures in this section yet.</p>
                  ) : (
                    s.lectures.map((l) => (
                      <div key={l._id} className="p-4 rounded-card border border-border bg-bg-surface-alt space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-ink-muted">
                              {l.type === 'video' ? '▶' : '📄'}
                            </span>
                            <span className="font-medium text-ink-primary">{l.title}</span>
                            <span className="text-micro bg-bg-surface border px-1.5 py-0.5 rounded text-ink-muted uppercase">
                              {l.type}
                            </span>
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteLecture(l._id)} className="text-error-clay">
                            Delete
                          </Button>
                        </div>

                        {l.type === 'video' && (
                          <div className="mt-2 space-y-3">
                            {l.contentUrl ? (
                              <div className="rounded-card overflow-hidden bg-black aspect-video max-w-md border border-border">
                                <video src={l.contentUrl} controls className="w-full h-full" />
                              </div>
                            ) : uploadProgress[l._id] !== undefined ? (
                              <div className="space-y-2 max-w-md bg-bg-surface p-4 rounded border">
                                <div className="flex justify-between text-small text-ink-primary font-medium">
                                  <span>Uploading video...</span>
                                  <span>{uploadProgress[l._id]}%</span>
                                </div>
                                <div className="w-full bg-border rounded-full h-2">
                                  <div
                                    className="bg-trail-green h-2 rounded-full transition-all duration-150"
                                    style={{ width: `${uploadProgress[l._id]}%` }}
                                  />
                                </div>
                              </div>
                            ) : (
                              <div
                                onDragOver={(e) => { e.preventDefault(); setDragOver((prev) => ({ ...prev, [l._id]: true })) }}
                                onDragLeave={() => setDragOver((prev) => ({ ...prev, [l._id]: false }))}
                                onDrop={(e) => {
                                  e.preventDefault()
                                  setDragOver((prev) => ({ ...prev, [l._id]: false }))
                                  const file = e.dataTransfer.files?.[0]
                                  if (file) handleVideoUpload(l._id, file)
                                }}
                                className={`border-2 border-dashed rounded-btn p-6 text-center cursor-pointer transition-colors max-w-md ${dragOver[l._id]
                                  ? 'border-trail-green bg-trail-green/5'
                                  : 'border-border-color bg-bg-surface hover:border-trail-green hover:bg-bg-surface-alt'
                                  }`}
                              >
                                <input
                                  type="file"
                                  accept="video/*"
                                  onChange={(e) => { const file = e.target.files?.[0]; if (file) handleVideoUpload(l._id, file) }}
                                  className="hidden"
                                  id={`file-${l._id}`}
                                />
                                <label htmlFor={`file-${l._id}`} className="cursor-pointer space-y-2 block">
                                  <div className="text-display-s text-ink-muted">📤</div>
                                  <div className="text-small font-medium text-ink-primary">
                                    Drag video file here or <span className="text-trail-green underline">browse</span>
                                  </div>
                                  <div className="text-micro text-ink-muted">MP4, WebM or QuickTime up to 500MB</div>
                                </label>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}

                  {/* Add Lecture section */}
                  <div className="pt-2">
                    {activeAddLectureSection === s._id ? (
                      <div className="bg-bg-surface-alt p-4 rounded-btn border border-border space-y-3 max-w-md">
                        <h4 className="text-small font-semibold text-ink-primary">Create New Lecture</h4>
                        <Input
                          label="Lecture Title"
                          placeholder="Introduction to..."
                          value={newLectureForm.title}
                          onChange={(e) => setNewLectureForm((f) => ({ ...f, title: e.target.value }))}
                        />
                        <div>
                          <label className="text-small font-medium text-ink-primary mb-1 block">Lecture Type</label>
                          <select
                            value={newLectureForm.type}
                            onChange={(e) => setNewLectureForm((f) => ({ ...f, type: e.target.value }))}
                            className="w-full px-3 py-2 rounded-btn border border-border bg-bg-surface text-small text-ink-primary focus:outline-none"
                          >
                            <option value="video">Video Lecture</option>
                            <option value="pdf">PDF Resource</option>
                            <option value="text">Text Document</option>
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleCreateLecture(s._id)}>Create</Button>
                          <Button size="sm" variant="ghost" onClick={() => setActiveAddLectureSection(null)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <Button size="sm" variant="secondary" onClick={() => { setActiveAddLectureSection(s._id); setNewLectureForm({ title: '', type: 'video' }) }}>
                        + Add Lecture
                      </Button>
                    )}
                  </div>
                </div>
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

