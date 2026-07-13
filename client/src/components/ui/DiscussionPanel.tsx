import { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import type { RootState } from '../../features/store'
import courseService, { type DiscussionPost } from '../../services/courseService'
import { XIcon } from './Icons'
import Button from './Button'

interface Props {
  courseId: string
  lectureId?: string
  courseSlug: string
}

// The single thing being replied to right now — drives both which reply
// gets tagged and which comment/reply gets visually highlighted.
interface ReplyTarget {
  /** top-level post the reply is actually submitted against */
  postId: string
  /** exact comment/reply id to highlight (post itself, or one of its replies) */
  highlightId: string
  /** @name shown in the composer + prefilled into the textarea */
  name: string
}

// Trash icon SVG
function TrashIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  )
}

// Confirm delete modal
function DeleteConfirmModal({
  open,
  onCancel,
  onConfirm,
}: {
  open: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onCancel}>
      <div
        className="bg-bg-surface rounded-card shadow-xl p-6 max-w-sm w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-error-clay/10 flex items-center justify-center shrink-0">
            <TrashIcon className="w-5 h-5 text-error-clay" />
          </div>
          <h3 className="font-display text-heading text-ink-primary">Delete post?</h3>
        </div>
        <p className="text-small text-ink-muted mb-5">
          This post will be permanently deleted and cannot be recovered.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-small font-medium bg-error-clay text-white rounded-btn hover:opacity-90 transition-opacity"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

function timeAgo(iso: string) {
  const d = new Date(iso)
  const diff = Math.floor((Date.now() - d.getTime()) / 1000)
  if (diff < 60) return 'now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`
  return d.toLocaleDateString()
}

// A single TikTok-style comment: avatar on the left, everything else stacked
// on the right — name + time on their own line, the message as plain text
// (no bubble/border), and a compact action row underneath. No divider lines
// anywhere; comments are separated by whitespace alone, exactly like TikTok.
function Comment({
  avatarClass,
  avatarLabel,
  name,
  isInstructor,
  createdAt,
  content,
  canDelete,
  onDelete,
  onReply,
  highlighted,
  children,
}: {
  avatarClass: string
  avatarLabel: string
  name: string
  isInstructor?: boolean
  createdAt: string
  content: string
  canDelete: boolean
  onDelete: () => void
  onReply: () => void
  highlighted: boolean
  children?: React.ReactNode
}) {
  return (
    <div className={`flex items-start gap-2.5 rounded-2xl transition-colors duration-300 ${highlighted ? 'bg-trail-green/6 -mx-2 px-2 py-1.5' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-small font-semibold shrink-0 ${avatarClass}`}>
        {avatarLabel}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-micro font-semibold text-ink-muted">{name}</span>
          {isInstructor && (
            <span className="text-[10px] leading-none font-semibold bg-trail-amber/10 text-trail-amber px-1.5 py-0.5 rounded-pill">Instructor</span>
          )}
        </div>
        <p className="text-small text-ink-primary whitespace-pre-wrap leading-snug mt-0.5">{content}</p>
        <div className="flex items-center gap-3.5 mt-1">
          <span className="text-[11px] text-ink-muted">{timeAgo(createdAt)}</span>
          <button
            onClick={onReply}
            className={`text-[11px] font-semibold transition-colors ${highlighted ? 'text-trail-green' : 'text-ink-muted hover:text-ink-primary'}`}
          >
            Reply
          </button>
          {canDelete && (
            <button
              onClick={onDelete}
              className="text-ink-muted hover:text-error-clay transition-colors"
              aria-label="Delete"
            >
              <TrashIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  )
}

function PostItem({
  post,
  onDelete,
  onStartReply,
  highlightId,
  userId,
}: {
  post: DiscussionPost
  onDelete: (id: string) => void
  onStartReply: (postId: string, highlightId: string, name: string) => void
  highlightId: string | null
  userId?: string
}) {
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [repliesOpen, setRepliesOpen] = useState(false)

  const handleDeleteConfirmed = () => {
    if (deleteTarget) {
      onDelete(deleteTarget)
      setDeleteTarget(null)
    }
  }

  return (
    <>
      <DeleteConfirmModal
        open={deleteTarget !== null}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirmed}
      />

      <Comment
        avatarClass="bg-trail-green/10 text-trail-green"
        avatarLabel={post.author.name.charAt(0).toUpperCase()}
        name={post.author.name}
        isInstructor={post.isInstructorReply}
        createdAt={post.createdAt}
        content={post.content}
        canDelete={userId === post.author._id}
        onDelete={() => setDeleteTarget(post._id)}
        onReply={() => { onStartReply(post._id, post._id, post.author.name); setRepliesOpen(true) }}
        highlighted={highlightId === post._id}
      >
        {post.replies?.length > 0 && (
          <button
            onClick={() => setRepliesOpen((o) => !o)}
            className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-ink-muted hover:text-ink-primary transition-colors"
          >
            <span className="inline-block w-4 h-px bg-ink-muted/40" />
            {repliesOpen ? 'Hide' : 'View'} {post.replies.length} {post.replies.length === 1 ? 'reply' : 'replies'}
            <svg
              className={`w-3 h-3 transition-transform ${repliesOpen ? 'rotate-180' : ''}`}
              viewBox="0 0 20 20" fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </button>
        )}

        {/* Replies — indented under the parent with each avatar aligned to
            the trunk, exactly like TikTok's reply list. No border lines. */}
        <AnimatePresence initial={false}>
          {repliesOpen && post.replies?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3 space-y-3">
                {post.replies.map((reply) => (
                  <Comment
                    key={reply._id}
                    avatarClass="bg-signal-blue/10 text-signal-blue"
                    avatarLabel={reply.author.name.charAt(0).toUpperCase()}
                    name={reply.author.name}
                    isInstructor={reply.isInstructorReply}
                    createdAt={reply.createdAt}
                    content={reply.content}
                    canDelete={userId === reply.author._id}
                    onDelete={() => setDeleteTarget(reply._id)}
                    onReply={() => onStartReply(post._id, reply._id, reply.author.name)}
                    highlighted={highlightId === reply._id}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Comment>
    </>
  )
}

export default function DiscussionPanel({ courseId, lectureId }: Props) {
  const { user } = useSelector((s: RootState) => s.auth)
  const [posts, setPosts] = useState<DiscussionPost[]>([])
  const [loading, setLoading] = useState(true)
  const [composerText, setComposerText] = useState('')
  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await courseService.getDiscussions(courseId, lectureId)
      setPosts(data.posts)
    } catch {
      setError('Failed to load discussions')
    } finally {
      setLoading(false)
    }
  }, [courseId, lectureId])

  useEffect(() => { load() }, [load])

  // Reset the composer whenever the lecture changes, since replyTarget ids
  // belong to the previous lecture's discussion thread.
  useEffect(() => {
    setComposerText('')
    setReplyTarget(null)
  }, [lectureId])

  const startReply = (postId: string, highlightId: string, name: string) => {
    setReplyTarget({ postId, highlightId, name })
    setComposerText(`@${name} `)
  }

  const cancelReply = () => {
    setReplyTarget(null)
    setComposerText('')
  }

  const handleSubmit = async () => {
    if (!composerText.trim()) return
    setSubmitting(true)
    setError('')
    try {
      if (replyTarget) {
        const { post } = await courseService.createDiscussionPost(courseId, {
          content: composerText,
          lectureId,
          parentPostId: replyTarget.postId,
        })
        setPosts((prev) =>
          prev.map((p) =>
            p._id === replyTarget.postId ? { ...p, replies: [...(p.replies || []), post] } : p,
          ),
        )
        setReplyTarget(null)
      } else {
        const { post } = await courseService.createDiscussionPost(courseId, {
          content: composerText,
          lectureId,
        })
        setPosts((prev) => [{ ...post, replies: [] }, ...prev])
      }
      setComposerText('')
    } catch {
      setError(replyTarget ? 'Failed to post reply. Please try again.' : 'Failed to post. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (postId: string) => {
    try {
      await courseService.deleteDiscussionPost(postId)
      setPosts((prev) =>
        prev
          .filter((p) => p._id !== postId)
          .map((p) => ({ ...p, replies: p.replies.filter((r) => r._id !== postId) })),
      )
      if (replyTarget?.highlightId === postId) cancelReply()
    } catch {
      setError('Failed to delete post')
    }
  }

  return (
    // Fixed-height TikTok-style panel: comment feed scrolls independently
    // inside its own rounded surface, the composer stays pinned to the
    // bottom of the panel at all times — no hard divider lines anywhere,
    // just soft elevation to separate the two zones.
    <div className="flex flex-col h-[min(70vh,640px)] rounded-card bg-bg-surface shadow-sm overflow-hidden">
      <h3 className="font-display text-heading text-ink-primary px-4 pt-4 pb-2 shrink-0">
        {lectureId ? 'Lecture Q&A' : 'Course Q&A'}
      </h3>

      {/* Scrollable feed */}
      <div className="flex-1 overflow-y-auto px-4 pb-2 min-h-0">
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => <div key={i} className="h-16 bg-bg-surface-alt rounded-card animate-pulse" />)}
          </div>
        ) : posts.length === 0 ? (
          <p className="text-small text-ink-muted text-center py-8">
            No questions yet — be the first to ask!
          </p>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostItem
                key={post._id}
                post={post}
                onDelete={handleDelete}
                onStartReply={startReply}
                highlightId={replyTarget?.highlightId ?? null}
                userId={user?._id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Static composer — pinned at the bottom of the panel, TikTok-style.
          Doubles as "ask a question" (default) and "reply" (when a
          Reply button above was tapped) modes. Elevated with a soft top
          shadow instead of a hard border line to separate it from the feed. */}
      <div className="shrink-0 bg-bg-surface px-4 pt-3 pb-3 shadow-[0_-6px_12px_-10px_rgba(0,0,0,0.18)]">
        {user ? (
          <>
            <AnimatePresence>
              {replyTarget && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-micro text-ink-muted">
                      Replying to <span className="font-medium text-trail-green">{replyTarget.name}</span>
                    </span>
                    <button
                      onClick={cancelReply}
                      className="text-ink-muted hover:text-error-clay transition-colors"
                      aria-label="Cancel reply"
                    >
                      <XIcon className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex items-end gap-2 bg-bg-surface-alt rounded-pill px-4 py-2">
              <textarea
                value={composerText}
                onChange={(e) => setComposerText(e.target.value)}
                placeholder={replyTarget ? 'Write a reply…' : 'Ask a question or share a thought…'}
                rows={1}
                className="flex-1 bg-transparent text-small text-ink-primary placeholder:text-ink-muted focus:outline-none resize-none py-1"
                maxLength={2000}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit()
                  }
                }}
              />
              <Button
                size="sm"
                isLoading={submitting}
                onClick={handleSubmit}
                disabled={!composerText.trim()}
                className="!rounded-pill shrink-0"
              >
                {replyTarget ? 'Reply' : 'Post'}
              </Button>
            </div>
            {error && <p className="text-small text-error-clay mt-1.5">{error}</p>}
          </>
        ) : (
          <p className="text-small text-ink-muted py-1">Sign in to ask questions.</p>
        )}
      </div>
    </div>
  )
}
