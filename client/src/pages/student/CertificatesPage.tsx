import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import AppShell from '../../components/layout/AppShell'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import api from '../../services/api'

interface Certificate {
  _id: string
  certificateId: string
  courseTitle: string
  instructorName: string
  issuedAt: string
  course: { title: string; slug: string; level: string }
}

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  useEffect(() => {
    api.get('/student/certificates')
      .then((r) => setCertificates(r.data.data.certificates))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleDownload = async (cert: Certificate) => {
    setDownloadingId(cert.certificateId)
    try {
      const res = await api.get(`/certificates/${cert.certificateId}/download`, { responseType: 'blob' })
      const blobUrl = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = `EduNext-Certificate-${cert.certificateId.slice(0, 8)}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(blobUrl)
    } catch {
      // no-op — the button itself surfaces no error state beyond stopping the spinner
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="space-y-6"
      >
        <div>
          <h1 className="font-display text-display-l text-ink-primary mb-1">My certificates</h1>
          <p className="text-body text-ink-muted">Your earned credentials, shareable and verifiable.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => <div key={i} className="h-40 bg-bg-surface-alt rounded-card animate-pulse" />)}
          </div>
        ) : certificates.length === 0 ? (
          <Card className="p-10 text-center">
            <p className="text-display-s mb-3">🎓</p>
            <p className="text-body text-ink-muted mb-4">No certificates yet — complete a course to earn your first one.</p>
            <Link to="/courses"><Button>Browse courses</Button></Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certificates.map((cert, i) => (
              <motion.div
                key={cert._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Card className="p-6 border-trail-amber/20 bg-gradient-to-br from-trail-amber/5 to-transparent">
                  <div className="flex items-start gap-4">
                    <span className="text-2xl shrink-0">🏅</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-heading text-ink-primary truncate">{cert.courseTitle}</h3>
                      <p className="text-small text-ink-muted mb-1">Instructor: {cert.instructorName}</p>
                      <p className="text-small text-ink-muted mb-3">
                        Issued {new Date(cert.issuedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        <a
                          href={`/certificates/verify/${cert.certificateId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-micro font-mono text-trail-green bg-trail-green/10 px-2 py-1 rounded-pill hover:bg-trail-green/20 transition-colors"
                        >
                          ID: {cert.certificateId.slice(0, 8)}…
                        </a>
                        <Button size="sm" variant="ghost" onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/certificates/verify/${cert.certificateId}`)
                        }}>
                          Copy link
                        </Button>
                        <Button
                          size="sm"
                          isLoading={downloadingId === cert.certificateId}
                          onClick={() => handleDownload(cert)}
                        >
                          Download certificate
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </AppShell>
  )
}
