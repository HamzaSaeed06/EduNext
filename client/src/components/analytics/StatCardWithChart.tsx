import { LineChart, Line, ResponsiveContainer } from 'recharts'
import Card from '../ui/Card'

interface ChartDataPoint {
  value: number
}

interface StatCardWithChartProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  color?: 'green' | 'blue' | 'amber' | 'purple'
  trend?: number
  trendLabel?: string
  sparklineData?: ChartDataPoint[]
  loading?: boolean
}

const colorClasses = {
  green: {
    text: 'text-trail-green',
    spark: '#2F6F4E',
    bg: 'bg-trail-green/10',
  },
  blue: {
    text: 'text-signal-blue',
    spark: '#3556D9',
    bg: 'bg-signal-blue/10',
  },
  amber: {
    text: 'text-trail-amber',
    spark: '#E2A03E',
    bg: 'bg-trail-amber/10',
  },
  purple: {
    text: 'text-signal-blue',
    spark: '#6C87F0',
    bg: 'bg-signal-blue/10',
  },
}

export default function StatCardWithChart({
  label,
  value,
  icon,
  color = 'green',
  trend,
  trendLabel,
  sparklineData = [],
  loading = false,
}: StatCardWithChartProps) {
  if (loading) {
    return (
      <Card className="p-4">
        <div className="space-y-3">
          <div className="h-4 bg-bg-surface-alt rounded animate-pulse w-24" />
          <div className="h-8 bg-bg-surface-alt rounded animate-pulse w-32" />
          <div className="h-12 bg-bg-surface-alt rounded animate-pulse w-full" />
        </div>
      </Card>
    )
  }

  const colorClass = colorClasses[color]
  const hasSparkline = sparklineData && sparklineData.length > 0

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-3">
        {/* Header with label and icon */}
        <div className="flex items-start justify-between">
          <p className="text-small text-ink-muted">{label}</p>
          {icon && (
            <div className={`w-10 h-10 rounded-btn ${colorClass.bg} flex items-center justify-center ${colorClass.text}`}>
              {icon}
            </div>
          )}
        </div>

        {/* Value and trend */}
        <div>
          <p className={`font-display text-display-s ${colorClass.text}`}>{value}</p>
          {trend !== undefined && trendLabel && (
            <p className="text-small text-ink-muted mt-1">
              {trend > 0 ? '↑' : trend < 0 ? '↓' : '–'} {trendLabel}
            </p>
          )}
        </div>

        {/* Sparkline chart */}
        {hasSparkline && (
          <div className="h-12 -mx-4 -mb-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={colorClass.spark}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </Card>
  )
}
