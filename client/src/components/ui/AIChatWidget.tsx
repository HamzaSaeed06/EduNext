import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import courseService from '../../services/courseService'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Props {
  courseId: string
  lectureId?: string
}

export default function AIChatWidget({ courseId, lectureId }: Props) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      inputRef.current?.focus()
    }
  }, [open, messages])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: Message = { role: 'user', content: text }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setLoading(true)
    setError('')

    try {
      const { reply } = await courseService.aiChat({
        courseId,
        lectureId,
        message: text,
        history: messages.slice(-10),
      })
      setMessages((m) => [...m, { role: 'assistant', content: reply }])
    } catch {
      setError('AI Tutor is unavailable right now. Try again shortly.')
      setMessages((m) => m.slice(0, -1))
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.15 }}
            className="w-80 bg-bg-surface rounded-card shadow-card-hover border border-signal-blue/20 flex flex-col overflow-hidden"
            style={{ height: '420px' }}
          >
            {/* Header */}
            <div className="bg-signal-blue px-4 py-3 flex items-center gap-2 shrink-0">
              <svg className="w-4 h-4 text-white" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <circle cx="8" cy="8" r="7" opacity="0.3" />
                <path d="M8 4a1 1 0 011 1v3a1 1 0 01-2 0V5a1 1 0 011-1zm0 7a1 1 0 100 2 1 1 0 000-2z" />
              </svg>
              <span className="text-small font-medium text-white flex-1">AI Tutor</span>
              <button
                onClick={() => setOpen(false)}
                className="text-white/70 hover:text-white transition-colors"
                aria-label="Close chat"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
              {messages.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-small text-ink-muted">
                    Ask me anything about this course. I'm here to help!
                  </p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-full bg-signal-blue flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
                        <circle cx="6" cy="6" r="5" opacity="0.3" />
                        <path d="M6 3a.75.75 0 01.75.75v2.5a.75.75 0 01-1.5 0v-2.5A.75.75 0 016 3zm0 5.5a.75.75 0 100 1.5.75.75 0 000-1.5z" />
                      </svg>
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-btn text-small whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-trail-green text-white rounded-tr-none'
                        : 'bg-signal-blue/5 text-ink-primary border border-signal-blue/10 rounded-tl-none'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-2 justify-start">
                  <div className="w-6 h-6 rounded-full bg-signal-blue flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
                      <circle cx="6" cy="6" r="5" opacity="0.3" />
                    </svg>
                  </div>
                  <div className="bg-signal-blue/5 border border-signal-blue/10 px-3 py-2 rounded-btn rounded-tl-none">
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-signal-blue animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-signal-blue animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-signal-blue animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  </div>
                </div>
              )}
              {error && (
                <p className="text-micro text-error-clay text-center">{error}</p>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="border-t border-border-color px-3 py-2 shrink-0">
              <div className="flex gap-2 items-end">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a question…"
                  rows={1}
                  maxLength={1000}
                  className="flex-1 px-2 py-1.5 rounded-btn border border-border-color bg-bg-surface text-small text-ink-primary focus:outline-none focus:border-signal-blue focus:ring-1 focus:ring-signal-blue resize-none"
                  style={{ minHeight: '36px', maxHeight: '80px' }}
                  aria-label="Message to AI Tutor"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  className="p-2 rounded-btn bg-signal-blue text-white disabled:opacity-40 hover:bg-signal-blue/90 transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-signal-blue focus:ring-offset-1"
                  aria-label="Send message"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
              <p className="text-micro text-ink-muted mt-1">Enter to send · Shift+Enter for new line</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((o) => !o)}
        className="w-12 h-12 rounded-full bg-signal-blue text-white shadow-card-hover flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-signal-blue focus:ring-offset-2 transition-colors"
        aria-label={open ? 'Close AI Tutor' : 'Open AI Tutor'}
        aria-expanded={open}
      >
        {open ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
            <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
          </svg>
        )}
      </motion.button>
    </div>
  )
}
