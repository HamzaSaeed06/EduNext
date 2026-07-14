import Card from '../ui/Card'

interface StatCardProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  color?: 'green' | 'blue' | 'amber' | 'purple'
}

const colorClasses = {
  green: 'text-trail-green',
  blue: 'text-signal-blue',
  amber: 'text-trail-amber',
  purple: 'text-signal-purple',
}

export default function StatCard({ label, value, icon, color = 'green' }: StatCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-small text-ink-muted mb-2">{label}</p>
          <p className={`font-display text-display-s ${colorClasses[color]}`}>{value}</p>
        </div>
        {icon && <div className={`w-10 h-10 rounded-lg bg-${color}/10 flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>}
      </div>
    </Card>
  )
}
