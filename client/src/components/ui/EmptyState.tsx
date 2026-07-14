import { ReactNode } from 'react'
import Button from './Button'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      {icon && (
        <div className="mb-4 p-3 rounded-full bg-bg-surface-alt text-ink-muted flex items-center justify-center">
          <div className="w-12 h-12 flex items-center justify-center">{icon}</div>
        </div>
      )}
      <h3 className="font-display text-heading text-ink-primary mb-2">{title}</h3>
      <p className="text-body text-ink-muted max-w-xs mb-6">{description}</p>
      {action && (
        <Button variant="primary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
