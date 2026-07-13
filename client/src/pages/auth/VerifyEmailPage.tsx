import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import authService from '../../services/authService'

export default function VerifyEmailPage() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    if (!token) { setStatus('error'); return }
    authService.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'))
  }, [token])

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="text-center max-w-md"
      >
        {status === 'loading' && (
          <>
            <div className="w-12 h-12 border-2 border-trail-green border-t-transparent rounded-full animate-spin mx-auto mb-4" aria-hidden="true" />
            <p className="text-body text-ink-muted">Verifying your email…</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-trail-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-trail-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="font-display text-heading text-ink-primary mb-2">Email verified!</h1>
            <p className="text-body text-ink-muted mb-6">Your account is confirmed. Start exploring courses.</p>
            <Link to="/dashboard" className="text-trail-green font-medium hover:underline text-small">Go to dashboard →</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-error-clay/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-error-clay" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="font-display text-heading text-ink-primary mb-2">Verification failed</h1>
            <p className="text-body text-ink-muted mb-6">
              That link is invalid or has expired. Request a new one from your account settings.
            </p>
            <Link to="/login" className="text-trail-green font-medium hover:underline text-small">Back to sign in</Link>
          </>
        )}
      </motion.div>
    </div>
  )
}
