import { useState, FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useDispatch } from 'react-redux'
import { setCredentials } from '../../features/auth/authSlice'
import { setAccessToken } from '../../services/api'
import authService from '../../services/authService'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

export default function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string })?.from ?? '/dashboard'

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { user, accessToken } = await authService.login(form.email, form.password)
      setAccessToken(accessToken)
      dispatch(setCredentials({ user, accessToken }))
      navigate(from, { replace: true })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
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
          <h1 className="font-display text-display-l text-ink-primary mb-2">Welcome back</h1>
          <p className="text-body text-ink-muted">Continue your learning trail</p>
        </div>

        <div className="bg-bg-surface rounded-card shadow-card border border-border-color p-8">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {error && (
              <div className="bg-error-clay/10 border border-error-clay/30 text-error-clay text-small px-4 py-3 rounded-btn" role="alert">
                {error}
              </div>
            )}
            <Input
              label="Email address"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              autoComplete="email"
              required
            />
            <div>
              <Input
                label="Password"
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                autoComplete="current-password"
                required
              />
              <div className="text-right mt-1">
                <Link to="/forgot-password" className="text-small text-trail-green hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>
            <Button type="submit" size="lg" className="w-full" isLoading={loading}>
              Sign in
            </Button>
          </form>
          <p className="text-center text-small text-ink-muted mt-6">
            No account?{' '}
            <Link to="/register" className="text-trail-green font-medium hover:underline">
              Create one — it's free
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
