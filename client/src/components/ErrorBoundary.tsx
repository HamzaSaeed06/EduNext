import { Component, type ReactNode } from 'react'
import Button from './ui/Button'
import { WarningIcon } from './ui/Icons'

interface Props { children: ReactNode }
interface State { hasError: boolean; message: string }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg-base flex items-center justify-center p-6">
          <div className="max-w-sm text-center">
            <WarningIcon className="w-10 h-10 mx-auto mb-4 text-trail-amber" />
            <h2 className="font-display text-heading text-ink-primary mb-2">Something went wrong</h2>
            <p className="text-small text-ink-muted mb-6">{this.state.message || 'An unexpected error occurred.'}</p>
            <Button onClick={() => { this.setState({ hasError: false, message: '' }); window.location.href = '/' }}>
              Go home
            </Button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
