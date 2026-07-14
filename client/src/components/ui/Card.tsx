import { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  hover?: boolean
  variant?: 'default' | 'elevated' | 'flat'
  className?: string
}

export default function Card({
  children,
  hover = false,
  variant = 'default',
  className = '',
  ...props
}: CardProps) {
  const variantClasses = {
    default: 'bg-bg-surface rounded-card shadow-card border border-border-color',
    elevated: 'bg-bg-surface rounded-card shadow-card-hover border border-border-color',
    flat: 'bg-bg-surface-alt rounded-card border border-transparent',
  }

  return (
    <div
      className={`
        ${variantClasses[variant]}
        ${hover ? 'transition-all duration-150 hover:-translate-y-0.5 hover:shadow-card-hover cursor-pointer' : 'transition-colors'}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}
