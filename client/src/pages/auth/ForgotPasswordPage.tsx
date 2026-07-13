import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import authService from '../../services/authService'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await authService.forgotPassword(email).catch(() => {})
    setSubmitted(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <svg viewBox="0 0 32 32" className="w-8 h-8" aria-hidden="true">
              <path d="M8,28 C6,20 14,16 10,8 C14,12 20,10 22,4 C24,14 16,18 20,28" fill="none" stroke="#2F6F4E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="22" cy="4" r="3" fill="#E2A03E" />
            </svg>
            <span className="font-display text-xl font-semibold text-ink-primary">EduNext</span>
          </Link>
          <h1 className="font-display text-display-l text-ink-primary mb-2">Reset your password</h1>
          <p className="text-body text-ink-muted">We'll send a reset link to your email</p>
        </div>

        <div className="bg-bg-surface rounded-card shadow-card border border-border-color p-8">
          {submitted ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-trail-green/10 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-trail-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-body text-ink-primary font-medium">Check your inbox</p>
              <p className="text-small text-ink-muted">
                If an account with <strong>{email}</strong> exists, you'll receive a reset link shortly.
              </p>
              <Link to="/login" className="text-small text-trail-green hover:underline">Back to sign in</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <Input
                label="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
              <Button type="submit" size="lg" className="w-full" isLoading={loading}>
                Send reset link
              </Button>
              <p className="text-center text-small text-ink-muted">
                <Link to="/login" className="text-trail-green hover:underline">Back to sign in</Link>
              </p>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  )
}
