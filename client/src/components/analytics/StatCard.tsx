import Card from '../ui/Card'

interface StatCardProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  color?: 'green' | 'blue' | 'amber' | 'purple'
  trend?: number
  trendLabel?: string
  loading?: boolean
}

const colorClasses = {
  green: {
    text: 'text-trail-green',
    bg: 'bg-trail-green/10',
  },
  blue: {
    text: 'text-signal-blue',
    bg: 'bg-signal-blue/10',
  },
  amber: {
    text: 'text-trail-amber',
    bg: 'bg-trail-amber/10',
  },
  purple: {
    text: 'text-signal-blue',
    bg: 'bg-signal-blue/10',
  },
}

export default function StatCard({
  label,
  value,
  icon,
  color = 'green',
  trend,
  trendLabel,
  loading = false,
}: StatCardProps) {
  if (loading) {
    return (
      <Card className="p-4">
        <div className="space-y-2">
          <div className="h-4 bg-bg-surface-alt rounded animate-pulse w-24" />
          <div className="h-8 bg-bg-surface-alt rounded animate-pulse w-32" />
        </div>
      </Card>
    )
  }

  const colors = colorClasses[color]

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-small text-ink-muted mb-2">{label}</p>
          <p className={`font-display text-display-s ${colors.text}`}>{value}</p>
          {trend !== undefined && trendLabel && (
            <p className="text-small text-ink-muted mt-2">
              {trend > 0 ? '↑' : trend < 0 ? '↓' : '–'} {trendLabel}
            </p>
          )}
        </div>
        {icon && (
          <div className={`w-10 h-10 rounded-btn ${colors.bg} flex items-center justify-center ${colors.text}`}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  )
}
