export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-bg-base">
      <div className="flex flex-col items-center gap-4">
        <svg
          className="w-12 h-12 animate-spin"
          viewBox="0 0 48 48"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="#DADFD3"
            strokeWidth="3"
          />
          <path
            d="M24 4 A20 20 0 0 1 44 24"
            stroke="#2F6F4E"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
        <span className="text-small text-ink-muted font-body">Loading...</span>
      </div>
    </div>
  )
}
