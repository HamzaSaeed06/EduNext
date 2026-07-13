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

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-small">
              <span className="bg-bg-surface px-3 text-ink-muted">Or continue with</span>
            </div>
          </div>

          <a
            href="/api/v1/auth/google"
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-bg-surface-alt text-ink-primary font-medium border border-border rounded-btn py-2.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-blue"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
            </svg>
            Continue with Google
          </a>

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
