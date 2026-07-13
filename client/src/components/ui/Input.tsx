import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-small font-medium text-ink-primary font-body">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-3 py-2 rounded-btn border bg-bg-surface
            text-body text-ink-primary font-body
            placeholder:text-ink-muted
            border-border-color
            focus:outline-none focus:border-trail-green focus:ring-1 focus:ring-trail-green
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-error-clay focus:border-error-clay focus:ring-error-clay' : ''}
            ${className}
          `}
          {...props}
        />
        {hint && !error && <p className="text-small text-ink-muted">{hint}</p>}
        {error && <p className="text-small text-error-clay">{error}</p>}
      </div>
    )
  },
)

Input.displayName = 'Input'
export default Input
