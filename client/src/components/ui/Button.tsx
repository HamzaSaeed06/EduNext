import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  isLoading?: boolean
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-trail-amber text-white hover:bg-opacity-90 focus-visible:ring-trail-amber',
  secondary:
    'bg-bg-surface-alt text-ink-primary border border-border-color hover:bg-border-color focus-visible:ring-trail-amber',
  ghost:
    'bg-transparent text-ink-primary hover:bg-bg-surface-alt focus-visible:ring-trail-amber',
  danger:
    'bg-error-clay text-white hover:bg-opacity-90 focus-visible:ring-error-clay',
}

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-3 py-1.5 text-small',
  md: 'px-4 py-2 text-body',
  lg: 'px-6 py-3 text-body font-medium',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  isLoading = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2
        rounded-btn font-body font-medium
        transition-all duration-150
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      disabled={disabled ?? isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="w-4 h-4 animate-spin" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2" />
          <path d="M8 2 A6 6 0 0 1 14 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )}
      {children}
    </button>
  )
}
