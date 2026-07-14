import { InputHTMLAttributes, forwardRef } from 'react'
import { CheckCircleIcon, AlertTriangle } from './Icons'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  success?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, success = false, className = '', id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label htmlFor={inputId} className="text-small font-medium text-ink-primary font-body">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full px-3 py-2 rounded-btn border bg-bg-surface
              text-body text-ink-primary font-body
              placeholder:text-ink-muted
              border-border-color
              focus:outline-none focus:ring-1
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
              ${error ? 'border-error-clay focus:border-error-clay focus:ring-error-clay' : ''}
              ${success && !error ? 'border-trail-green focus:border-trail-green focus:ring-trail-green' : ''}
              ${!error && !success ? 'focus:border-trail-green focus:ring-trail-green' : ''}
              ${className}
            `}
            {...props}
          />
          {(error || success) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              {error && <AlertTriangle className="w-5 h-5 text-error-clay" />}
              {success && !error && <CheckCircleIcon className="w-5 h-5 text-trail-green" />}
            </div>
          )}
        </div>
        {hint && !error && <p className="text-small text-ink-muted">{hint}</p>}
        {error && <p className="text-small text-error-clay flex items-center gap-1"><AlertTriangle className="w-4 h-4" />{error}</p>}
      </div>
    )
  },
)

Input.displayName = 'Input'
export default Input
