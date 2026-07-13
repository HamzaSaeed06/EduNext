import { useState, FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import authService from '../../services/authService'
import { getErrorMessage } from '../../services/api'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authService.resetPassword(token, password)
      navigate('/login', { state: { message: 'Password reset successfully. Please sign in.' } })
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Reset failed. The link may have expired.'))
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-body text-error-clay mb-4">Invalid reset link.</p>
          <Link to="/forgot-password" className="text-trail-green hover:underline text-small">Request a new one</Link>
        </div>
      </div>
    )
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
          <h1 className="font-display text-display-l text-ink-primary mb-2">Choose a new password</h1>
          <p className="text-body text-ink-muted">Make it strong — at least 8 characters</p>
        </div>
        <div className="bg-bg-surface rounded-card shadow-card border border-border-color p-8">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {error && (
              <div className="bg-error-clay/10 border border-error-clay/30 text-error-clay text-small px-4 py-3 rounded-btn" role="alert">
                {error}
              </div>
            )}
            <Input
              label="New password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              hint="At least 8 characters, one uppercase letter, one number"
              required
            />
            <Button type="submit" size="lg" className="w-full" isLoading={loading}>
              Reset password
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
