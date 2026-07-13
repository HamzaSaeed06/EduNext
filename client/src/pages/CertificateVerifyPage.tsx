import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../services/api'

interface CertData {
  certificateId: string
  studentName: string
  courseTitle: string
  instructorName: string
  issuedAt: string
  course: { level: string; category: string }
}

export default function CertificateVerifyPage() {
  const { certId } = useParams<{ certId: string }>()
  const [cert, setCert] = useState<CertData | null>(null)
  const [loading, setLoading] = useState(true)
  const [invalid, setInvalid] = useState(false)

  useEffect(() => {
    api.get(`/certificates/verify/${certId}`)
      .then((r) => setCert(r.data.data.certificate))
      .catch(() => setInvalid(true))
      .finally(() => setLoading(false))
  }, [certId])

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-ink-muted hover:text-trail-green">
            <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
              <path d="M8,28 C6,20 14,16 10,8 C14,12 20,10 22,4 C24,14 16,18 20,28" fill="none" stroke="#2F6F4E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="22" cy="4" r="3" fill="#E2A03E" />
            </svg>
            <span className="font-display font-semibold text-ink-primary">EduNext</span>
          </Link>
        </div>

        {loading ? (
          <div className="h-64 bg-bg-surface rounded-card animate-pulse" />
        ) : invalid ? (
          <div className="bg-bg-surface rounded-card shadow-card border border-error-clay/20 p-8 text-center">
            <p className="text-2xl mb-3">❌</p>
            <h1 className="font-display text-heading text-ink-primary mb-2">Certificate not found</h1>
            <p className="text-body text-ink-muted">This certificate ID doesn't match any record in our system.</p>
          </div>
        ) : cert ? (
          <div className="bg-bg-surface rounded-card shadow-card border border-trail-amber/30 overflow-hidden">
            <div className="bg-gradient-to-br from-trail-green/10 to-trail-amber/10 p-8 text-center border-b border-border-color">
              <p className="text-3xl mb-3">🏅</p>
              <div className="inline-flex items-center gap-2 bg-trail-green/10 text-trail-green text-small px-3 py-1 rounded-pill mb-4">
                <span className="w-2 h-2 bg-trail-green rounded-full" /> Valid certificate
              </div>
              <h1 className="font-display text-display-s text-ink-primary">Certificate of Completion</h1>
            </div>
            <div className="p-8 space-y-4">
              <div>
                <p className="text-micro text-ink-muted uppercase tracking-wide mb-1">Student</p>
                <p className="font-display text-heading text-ink-primary">{cert.studentName}</p>
              </div>
              <div>
                <p className="text-micro text-ink-muted uppercase tracking-wide mb-1">Course completed</p>
                <p className="font-display text-heading text-ink-primary">{cert.courseTitle}</p>
                <p className="text-small text-ink-muted">{cert.course?.level} · {cert.course?.category}</p>
              </div>
              <div>
                <p className="text-micro text-ink-muted uppercase tracking-wide mb-1">Instructor</p>
                <p className="text-body text-ink-primary">{cert.instructorName}</p>
              </div>
              <div>
                <p className="text-micro text-ink-muted uppercase tracking-wide mb-1">Issued on</p>
                <p className="text-body text-ink-primary">
                  {new Date(cert.issuedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="pt-2 border-t border-border-color">
                <p className="text-micro font-mono text-ink-muted break-all">ID: {cert.certificateId}</p>
              </div>
            </div>
          </div>
        ) : null}
      </motion.div>
    </div>
  )
}
