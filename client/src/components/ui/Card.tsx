import { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  hover?: boolean
}

export default function Card({ children, hover = false, className = '', ...props }: CardProps) {
  return (
    <div
      className={`
        bg-bg-surface rounded-card shadow-card border border-border-color
        ${hover ? 'transition-all duration-150 hover:-translate-y-0.5 hover:shadow-card-hover cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}
