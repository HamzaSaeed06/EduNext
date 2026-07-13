import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useDispatch } from 'react-redux'
import { setCredentials } from '../../features/auth/authSlice'
import { setAccessToken } from '../../services/api'
import authService from '../../services/authService'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

export default function RegisterPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' as 'student' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { user, accessToken } = await authService.register(form)
      setAccessToken(accessToken)
      dispatch(setCredentials({ user, accessToken }))
      navigate('/dashboard', { replace: true })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center px-4 py-12">
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
          <h1 className="font-display text-display-l text-ink-primary mb-2">Start your first trail</h1>
          <p className="text-body text-ink-muted">Create a free account to begin learning</p>
        </div>

        <div className="bg-bg-surface rounded-card shadow-card border border-border-color p-8">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {error && (
              <div className="bg-error-clay/10 border border-error-clay/30 text-error-clay text-small px-4 py-3 rounded-btn" role="alert">
                {error}
              </div>
            )}
            <Input
              label="Full name"
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              autoComplete="name"
              required
            />
            <Input
              label="Email address"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              autoComplete="email"
              required
            />
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              autoComplete="new-password"
              hint="At least 8 characters, one uppercase letter, one number"
              required
            />
            <Button type="submit" size="lg" className="w-full" isLoading={loading}>
              Create account
            </Button>
          </form>
          <p className="text-center text-small text-ink-muted mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-trail-green font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
