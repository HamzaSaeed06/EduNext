interface TrailProgressProps {
  progress: number
  checkpoints?: number
  size?: 'mini' | 'full'
  className?: string
  completedCount?: number
  totalCount?: number
}

// Animated circular ring that shows the percentage
function ProgressRing({
  progress,
  size = 52,
}: {
  progress: number
  size?: number
}) {
  const radius = (size - 6) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0 -rotate-90" aria-hidden="true">
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#DADFD3"
        strokeWidth={5}
      />
      {/* Fill */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="url(#progressGrad)"
        strokeWidth={5}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
      <defs>
        <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3A8F62" />
          <stop offset="100%" stopColor="#5BB580" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function TrailProgress({
  progress,
  checkpoints = 5,
  size = 'mini',
  className = '',
  completedCount,
  totalCount,
}: TrailProgressProps) {
  const clamped = Math.min(100, Math.max(0, progress))

  if (size === 'mini') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {/* Circular ring */}
        <div className="relative shrink-0">
          <ProgressRing progress={clamped} size={48} />
          <span
            className="absolute inset-0 flex items-center justify-center text-micro font-bold text-trail-green"
            style={{ fontSize: 10 }}
          >
            {clamped}%
          </span>
        </div>

        {/* Right: bar + label */}
        <div className="flex-1 min-w-0">
          {completedCount !== undefined && totalCount !== undefined ? (
            <p className="text-micro text-ink-muted mb-1.5 truncate">
              {completedCount} of {totalCount} lessons done
            </p>
          ) : (
            <p className="text-micro text-ink-muted mb-1.5">Course progress</p>
          )}

          {/* Segmented bar */}
          <div className="relative h-2 w-full rounded-full bg-bg-surface-alt overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-trail-green to-green-400 transition-all duration-700"
              style={{ width: `${clamped}%` }}
            />
          </div>

          {/* Checkpoint dots */}
          <div className="flex justify-between mt-1.5">
            {Array.from({ length: checkpoints }).map((_, i) => {
              const pct = (i / (checkpoints - 1)) * 100
              const done = pct <= clamped
              return (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                    done ? 'bg-trail-green' : 'bg-border-color'
                  }`}
                />
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // Full (vertical) variant — sidebar timeline
  return (
    <div className={`flex flex-col items-center gap-1 py-2 ${className}`}>
      <div className="relative">
        <ProgressRing progress={clamped} size={64} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-small font-bold text-trail-green leading-none">{clamped}%</span>
          <span className="text-micro text-ink-muted leading-none mt-0.5">done</span>
        </div>
      </div>

      {/* Vertical segment lane */}
      <div className="relative w-1.5 rounded-full bg-bg-surface-alt overflow-hidden" style={{ height: 240 }}>
        <div
          className="absolute top-0 left-0 w-full rounded-full bg-gradient-to-b from-trail-green to-green-400 transition-all duration-700"
          style={{ height: `${clamped}%` }}
        />
      </div>

      {/* Checkpoint labels */}
      <div className="flex flex-col gap-1 w-full">
        {Array.from({ length: checkpoints }).map((_, i) => {
          const pct = (i / (checkpoints - 1)) * 100
          const done = pct <= clamped
          return (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full shrink-0 ${done ? 'bg-trail-green' : 'bg-border-color'}`} />
              <div className={`h-px flex-1 ${done ? 'bg-trail-green/30' : 'bg-border-color'}`} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
