interface TrailProgressProps {
  progress: number
  checkpoints?: number
  size?: 'mini' | 'full'
  className?: string
  completedCount?: number
  totalCount?: number
}

export default function TrailProgress({
  progress,
  checkpoints = 5,
  size = 'mini',
  className = '',
}: TrailProgressProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress))
  const viewBoxWidth = size === 'mini' ? 120 : 40
  const viewBoxHeight = size === 'mini' ? 24 : 300

  if (size === 'mini') {
    const totalLength = 110
    const filledLength = (clampedProgress / 100) * totalLength
    const dashOffset = totalLength - filledLength

    return (
      <svg
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        className={`w-full ${className}`}
        aria-hidden="true"
        role="img"
        aria-label={`Progress: ${clampedProgress}%`}
      >
        <path
          d="M5,12 C20,8 30,16 45,12 C60,8 70,16 85,12 C100,8 110,14 115,12"
          fill="none"
          stroke="#DADFD3"
          strokeWidth="2.5"
          strokeDasharray="4 3"
          strokeLinecap="round"
        />
        <path
          d="M5,12 C20,8 30,16 45,12 C60,8 70,16 85,12 C100,8 110,14 115,12"
          fill="none"
          stroke="#2F6F4E"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={`${totalLength}`}
          strokeDashoffset={`${dashOffset}`}
          className="trail-animate"
        />
        {Array.from({ length: checkpoints }).map((_, i) => {
          const cx = 5 + (i / (checkpoints - 1)) * 110
          const isCompleted = (i / (checkpoints - 1)) * 100 <= clampedProgress
          const isCurrent =
            !isCompleted &&
            i > 0 &&
            ((i - 1) / (checkpoints - 1)) * 100 <= clampedProgress

          return (
            <circle
              key={i}
              cx={cx}
              cy={12}
              r={3}
              fill={isCompleted ? '#2F6F4E' : '#FFFFFF'}
              stroke={isCompleted ? '#2F6F4E' : isCurrent ? '#2F6F4E' : '#DADFD3'}
              strokeWidth={isCurrent ? 2 : 1.5}
              className={isCurrent ? 'animate-pulse' : ''}
            />
          )
        })}
      </svg>
    )
  }

  return (
    <svg
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
      className={`h-full ${className}`}
      aria-label={`Progress: ${clampedProgress}%`}
    >
      <path
        d="M20,10 C14,40 26,70 18,100 C12,130 24,160 20,190 C16,220 26,250 20,280 C18,290 20,295 20,295"
        fill="none"
        stroke="#DADFD3"
        strokeWidth="3"
        strokeDasharray="6 4"
        strokeLinecap="round"
      />
      <path
        d="M20,10 C14,40 26,70 18,100 C12,130 24,160 20,190 C16,220 26,250 20,280 C18,290 20,295 20,295"
        fill="none"
        stroke="#2F6F4E"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="400"
        strokeDashoffset={`${400 - (clampedProgress / 100) * 400}`}
        className="trail-animate"
      />
      {Array.from({ length: checkpoints }).map((_, i) => {
        const cy = 10 + (i / (checkpoints - 1)) * 285
        const isCompleted = (i / (checkpoints - 1)) * 100 <= clampedProgress
        const isCurrent =
          !isCompleted &&
          i > 0 &&
          ((i - 1) / (checkpoints - 1)) * 100 <= clampedProgress

        return (
          <circle
            key={i}
            cx={20}
            cy={cy}
            r={5}
            fill={isCompleted ? '#2F6F4E' : '#FFFFFF'}
            stroke={isCompleted ? '#2F6F4E' : isCurrent ? '#2F6F4E' : '#DADFD3'}
            strokeWidth={isCurrent ? 2.5 : 2}
            className={isCurrent ? 'animate-pulse' : ''}
          />
        )
      })}
    </svg>
  )
}
