import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '../../components/ui/Button'
import api from '../../services/api'
import { PartyIcon, BookOpenIcon } from '../../components/ui/Icons'

interface Question {
  _id: string
  text: string
  options: { _id: string; text: string }[]
}

interface QuizResult {
  score: number
  passed: boolean
  earned: number
  totalQuestions: number
  passingScore: number
  feedback: { questionId: string; correct: boolean; explanation: string; correctOptionId: string }[]
}

interface Props {
  quizId: string
  onComplete: (result: QuizResult) => void
  onClose: () => void
}

export default function QuizPlayer({ quizId, onComplete, onClose }: Props) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<QuizResult | null>(null)
  const [error, setError] = useState('')

  // Load quiz on mount
  useState(() => {
    api.get(`/quizzes/${quizId}`)
      .then((r) => setQuestions(r.data.data.quiz.questions || []))
      .catch(() => setError('Failed to load quiz'))
      .finally(() => setLoading(false))
  })

  const selectAnswer = (questionId: string, optionId: string) => {
    setAnswers((a) => ({ ...a, [questionId]: optionId }))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const payload = questions.map((q) => ({
        questionId: q._id,
        selectedOptionId: answers[q._id] || null,
      }))
      const res = await api.post(`/quizzes/${quizId}/submit`, { answers: payload })
      const r = res.data.data as QuizResult
      setResult(r)
      onComplete(r)
    } catch {
      setError('Failed to submit quiz')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="p-8 text-center text-ink-muted animate-pulse">Loading quiz…</div>
  if (error) return <div className="p-8 text-center text-error-clay">{error}</div>

  if (result) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="p-6">
        <div className={`text-center mb-6 p-6 rounded-card ${result.passed ? 'bg-trail-green/10 border border-trail-green/20' : 'bg-error-clay/10 border border-error-clay/20'}`}>
          <p className="text-display-s font-display mb-1 flex items-center justify-center gap-2">
            {result.passed
              ? <><PartyIcon className="w-7 h-7" /> Passed!</>
              : <><BookOpenIcon className="w-7 h-7" /> Try again</>}
          </p>
          <p className="text-heading font-mono text-ink-primary">{result.score}%</p>
          <p className="text-small text-ink-muted mt-1">{result.earned}/{result.totalQuestions} correct · {result.passingScore}% to pass</p>
        </div>
        <Button onClick={onClose} className="w-full">Continue learning</Button>
      </motion.div>
    )
  }

  const q = questions[current]
  const progress = ((current + 1) / questions.length) * 100

  return (
    <div className="p-6">
      {/* Progress bar */}
      <div className="w-full h-1.5 bg-bg-surface-alt rounded-full mb-6">
        <div className="h-full bg-trail-green rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>
      <p className="text-micro text-ink-muted mb-4">{current + 1} of {questions.length}</p>

      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.15 }}
        >
          <h3 className="font-display text-heading text-ink-primary mb-5">{q.text}</h3>
          <div className="space-y-2 mb-6">
            {q.options.map((opt) => (
              <button
                key={opt._id}
                onClick={() => selectAnswer(q._id, opt._id)}
                className={`w-full text-left px-4 py-3 rounded-btn border transition-colors text-small ${answers[q._id] === opt._id
                    ? 'border-trail-green bg-trail-green/5 text-trail-green'
                    : 'border-border-color hover:border-trail-green hover:text-trail-green text-ink-primary'
                  }`}
              >
                {opt.text}
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-3">
        {current > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setCurrent((c) => c - 1)}>← Previous</Button>
        )}
        {current < questions.length - 1 ? (
          <Button size="sm" className="ml-auto" disabled={!answers[q._id]} onClick={() => setCurrent((c) => c + 1)}>Next →</Button>
        ) : (
          <Button size="sm" className="ml-auto" isLoading={submitting}
            disabled={Object.keys(answers).length < questions.length}
            onClick={handleSubmit}
          >
            Submit quiz
          </Button>
        )}
      </div>
    </div>
  )
}
