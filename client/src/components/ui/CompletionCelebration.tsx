import { useEffect, useState } from 'react'
import { TrophyIcon, CheckCircleIcon } from './Icons'
import Button from './Button'

interface CompletionCelebrationProps {
  isOpen: boolean
  title?: string
  message?: string
  courseTitle?: string
  certificateUrl?: string
  onClose: () => void
  onDownloadCertificate?: () => void
}

export default function CompletionCelebration({
  isOpen,
  title = 'Course Complete!',
  message = 'Congratulations on finishing this trail. You have earned a certificate!',
  courseTitle,
  certificateUrl,
  onClose,
  onDownloadCertificate,
}: CompletionCelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true)
      const timer = setTimeout(() => setShowConfetti(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center" onClick={onClose}>
        {/* Modal */}
        <div
          className="bg-bg-surface rounded-card shadow-card-hover max-w-md w-full mx-4 p-8 z-50 relative overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Confetti animation background */}
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {Array.from({ length: 50 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-pulse"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `-10px`,
                    animation: `fall ${2 + Math.random() * 1}s linear forwards`,
                    opacity: Math.random() * 0.7 + 0.3,
                  }}
                >
                  <span className="text-2xl">
                    {['🎉', '✨', '⭐', '🏆', '🎊'][Math.floor(Math.random() * 5)]}
                  </span>
                </div>
              ))}
              <style>{`
                @keyframes fall {
                  to {
                    transform: translateY(100vh) rotate(360deg);
                    opacity: 0;
                  }
                }
              `}</style>
            </div>
          )}

          {/* Content */}
          <div className="relative z-10 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-trail-green/10 flex items-center justify-center animate-bounce">
                <TrophyIcon className="w-8 h-8 text-trail-green" />
              </div>
            </div>

            <h2 className="font-display text-display-s text-ink-primary mb-2">{title}</h2>

            {courseTitle && (
              <p className="text-body text-ink-muted mb-4">
                <span className="font-medium text-trail-green">{courseTitle}</span>
              </p>
            )}

            <p className="text-body text-ink-muted mb-8">{message}</p>

            {certificateUrl && (
              <div className="mb-6 p-4 bg-trail-green/5 rounded-card border border-trail-green/20 flex items-center gap-3">
                <CheckCircleIcon className="w-5 h-5 text-trail-green flex-shrink-0" />
                <p className="text-small text-ink-primary">Your certificate is ready to download</p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              {certificateUrl && onDownloadCertificate && (
                <Button variant="primary" onClick={onDownloadCertificate}>
                  Download Certificate
                </Button>
              )}
              <Button variant="secondary" onClick={onClose}>
                Continue
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
