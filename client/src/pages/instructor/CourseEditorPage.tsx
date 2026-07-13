import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import AppShell from '../../components/layout/AppShell'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import courseService, { type Course, type Section } from '../../services/courseService'
import api, { getErrorMessage } from '../../services/api'
import { validateVideoFile } from '../../utils/videoUpload'
import { PlayCircleIcon, DocumentIcon, VideoCameraIcon } from '../../components/ui/Icons'

const MAX_PDF_BYTES = 50 * 1024 * 1024

function validatePdfFile(file: File): { valid: boolean; error?: string } {
  if (file.type !== 'application/pdf') return { valid: false, error: 'Only PDF files are allowed.' }
  if (file.size > MAX_PDF_BYTES) return { valid: false, error: 'PDF must be under 50 MB.' }
  return { valid: true }
}

function UploadProgressBar({ label, progress }: { label: string; progress: number }) {
  return (
    <div className="space-y-2 max-w-md bg-bg-surface p-4 rounded-card border border-border-color">
      <div className="flex justify-between text-small text-ink-primary font-medium">
        <span>{label}</span>
        <span>{progress}%</span>
      </div>
      <div className="w-full bg-bg-surface-alt rounded-full h-2">
        <div
          className="bg-trail-green h-2 rounded-full transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

function UploadDropZone({
  id, accept, label, hint, icon, dragOver, compact,
  onDragOver, onDragLeave, onDrop, onChange,
}: {
  id: string; accept: string; label: string; hint: string; icon?: React.ReactNode
  dragOver: boolean; compact?: boolean
  onDragOver: () => void; onDragLeave: () => void
  onDrop: (file: File) => void; onChange: (file: File) => void
}) {
  if (compact) {
    return (
      <>
        <input type="file" accept={accept} id={id} className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onChange(f) }} />
        <label htmlFor={id}
          className="text-micro text-trail-green hover:underline cursor-pointer whitespace-nowrap">
          {label}
        </label>
      </>
    )
  }
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); onDragOver() }}
      onDragLeave={onDragLeave}
      onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) onDrop(f) }}
      className={`border-2 border-dashed rounded-btn p-6 text-center cursor-pointer transition-colors max-w-md ${
        dragOver ? 'border-trail-green bg-trail-green/5' : 'border-border-color bg-bg-surface hover:border-trail-green hover:bg-bg-surface-alt'
      }`}
    >
      <input type="file" accept={accept} id={id} className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onChange(f) }} />
      <label htmlFor={id} className="cursor-pointer space-y-2 block">
        {icon && <div className="flex justify-center text-ink-muted mb-1">{icon}</div>}
        <div className="text-small font-medium text-ink-primary">
          {label} <span className="text-trail-green underline">browse</span>
        </div>
        {hint && <div className="text-micro text-ink-muted">{hint}</div>}
      </label>
    </div>
  )
}

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

  // AI summary state
  const [generatingSummary, setGeneratingSummary] = useState(false)

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
      setError(getErrorMessage(err, 'Failed to save'))
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

  const handlePdfUpload = async (lectureId: string, file: File) => {
    const validation = validatePdfFile(file)
    if (!validation.valid) { setError(validation.error!); return }
    setError('')
    try {
      const sigRes = await api.post(`/courses/lectures/${lectureId}/upload-signature`, {
        fileSize: file.size,
        fileType: file.type,
      })
      const { signature, timestamp, apiKey, cloudName, folder, resourceType } = sigRes.data.data

      setUploadProgress((prev) => ({ ...prev, [lectureId]: 5 }))

      if (signature === 'mock_signature') {
        for (let p = 10; p <= 100; p += 10) {
          await new Promise((r) => setTimeout(r, 100))
          setUploadProgress((prev) => ({ ...prev, [lectureId]: p }))
        }
        await api.post(`/courses/lectures/${lectureId}/confirm-upload`, {
          url: `https://placeholder.edunext.dev/edunext/pdf/${Date.now()}.pdf`,
          duration: 0,
        })
      } else {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('api_key', apiKey)
        fd.append('timestamp', String(timestamp))
        fd.append('signature', signature)
        fd.append('folder', folder)

        const uploadRes = await axios.post(
          `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
          fd,
          {
            onUploadProgress: (e) => {
              const tot = e.total || file.size
              setUploadProgress((prev) => ({ ...prev, [lectureId]: Math.round((e.loaded * 100) / tot) }))
            },
          }
        )

        await api.post(`/courses/lectures/${lectureId}/confirm-upload`, {
          url: uploadRes.data.secure_url,
          duration: 0,
        })
      }

      setSuccess('PDF uploaded successfully!')
      setTimeout(() => setSuccess(''), 2000)
      await reloadSections()
    } catch {
      setError('PDF upload failed. Please try again.')
    } finally {
      setUploadProgress((prev) => { const n = { ...prev }; delete n[lectureId]; return n })
    }
  }

  const handleGenerateSummary = async () => {
    if (!id) return
    setGeneratingSummary(true)
    setError('')
    try {
      const { summary } = await courseService.aiSummarize(id)
      setForm((f) => ({ ...f, description: summary }))
    } catch {
      setError('AI summary failed. Check your Gemini API key or try again.')
    } finally {
      setGeneratingSummary(false)
    }
  }

  const handleSubmit = async () => {
    if (!id) return
    try {
      await courseService.submitCourse(id)
      navigate('/instructor/courses')
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to submit'))
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
              <div className="flex items-center justify-between mb-1">
                <label className="text-small font-medium text-ink-primary">Description</label>
                <button
                  type="button"
                  onClick={handleGenerateSummary}
                  disabled={generatingSummary}
                  className="inline-flex items-center gap-1.5 text-micro font-medium text-trail-green hover:text-trail-green/80 disabled:opacity-50 transition-colors"
                >
                  {generatingSummary ? (
                    <>
                      <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Generating…
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      Generate with AI
                    </>
                  )}
                </button>
              </div>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={5}
                className="w-full px-3 py-2 rounded-btn border border-border-color bg-bg-surface text-body text-ink-primary focus:outline-none focus:border-trail-green focus:ring-1 focus:ring-trail-green"
              />
              <p className="text-micro text-ink-muted mt-1">AI uses your title, category, and level to write a draft — edit it to make it yours.</p>
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
                              {l.type === 'video'
                                ? <PlayCircleIcon className="w-4 h-4" />
                                : <DocumentIcon className="w-4 h-4" />}
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

                        {/* Video upload zone */}
                        {l.type === 'video' && (
                          <div className="mt-2 space-y-3">
                            {l.contentUrl ? (
                              <div className="rounded-card overflow-hidden bg-black aspect-video max-w-md border border-border">
                                <video src={l.contentUrl} controls className="w-full h-full" />
                              </div>
                            ) : uploadProgress[l._id] !== undefined ? (
                              <UploadProgressBar label="Uploading video…" progress={uploadProgress[l._id]} />
                            ) : (
                              <UploadDropZone
                                id={`file-${l._id}`}
                                accept="video/*"
                                label="Drag video file here or"
                                hint="MP4, WebM or QuickTime up to 500MB"
                                dragOver={dragOver[l._id]}
                                onDragOver={() => setDragOver((p) => ({ ...p, [l._id]: true }))}
                                onDragLeave={() => setDragOver((p) => ({ ...p, [l._id]: false }))}
                                onDrop={(file) => { setDragOver((p) => ({ ...p, [l._id]: false })); handleVideoUpload(l._id, file) }}
                                onChange={(file) => handleVideoUpload(l._id, file)}
                                icon={<VideoCameraIcon className="w-8 h-8" />}
                              />
                            )}
                          </div>
                        )}

                        {/* PDF upload zone */}
                        {l.type === 'pdf' && (
                          <div className="mt-2 space-y-3">
                            {l.contentUrl ? (
                              <div className="flex items-center gap-3 p-4 rounded-card border border-border bg-bg-surface-alt max-w-md">
                                <DocumentIcon className="w-8 h-8 text-ink-muted flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-small font-medium text-ink-primary truncate">PDF uploaded</p>
                                  <a href={l.contentUrl} target="_blank" rel="noopener noreferrer" className="text-micro text-trail-green hover:underline">
                                    View PDF ↗
                                  </a>
                                </div>
                                <UploadDropZone
                                  id={`pdf-replace-${l._id}`}
                                  accept=".pdf,application/pdf"
                                  label="Replace"
                                  hint=""
                                  dragOver={false}
                                  onDragOver={() => {}}
                                  onDragLeave={() => {}}
                                  onDrop={(file) => handlePdfUpload(l._id, file)}
                                  onChange={(file) => handlePdfUpload(l._id, file)}
                                  compact
                                />
                              </div>
                            ) : uploadProgress[l._id] !== undefined ? (
                              <UploadProgressBar label="Uploading PDF…" progress={uploadProgress[l._id]} />
                            ) : (
                              <UploadDropZone
                                id={`pdf-${l._id}`}
                                accept=".pdf,application/pdf"
                                label="Drag PDF here or"
                                hint="PDF up to 50MB"
                                dragOver={dragOver[l._id]}
                                onDragOver={() => setDragOver((p) => ({ ...p, [l._id]: true }))}
                                onDragLeave={() => setDragOver((p) => ({ ...p, [l._id]: false }))}
                                onDrop={(file) => { setDragOver((p) => ({ ...p, [l._id]: false })); handlePdfUpload(l._id, file) }}
                                onChange={(file) => handlePdfUpload(l._id, file)}
                                icon={<DocumentIcon className="w-8 h-8" />}
                              />
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

