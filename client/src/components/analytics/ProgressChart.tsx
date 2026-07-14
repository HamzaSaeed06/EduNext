import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Card from '../ui/Card'

interface DataPoint {
  name: string
  progress: number
}

interface ProgressChartProps {
  title: string
  data: DataPoint[]
  color?: string
  loading?: boolean
}

export default function ProgressChart({ title, data, color = '#10b981', loading }: ProgressChartProps) {
  if (loading) {
    return (
      <Card className="p-6">
        <h3 className="font-display text-heading text-ink-primary mb-4">{title}</h3>
        <div className="h-64 bg-bg-surface-alt rounded animate-pulse" />
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h3 className="font-display text-heading text-ink-primary mb-4">{title}</h3>
      {data && data.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '12px' }} />
            <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#111827' }}
            />
            <Line
              type="monotone"
              dataKey="progress"
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-64 flex items-center justify-center bg-bg-surface-alt rounded">
          <p className="text-ink-muted">No data available</p>
        </div>
      )}
    </Card>
  )
}
