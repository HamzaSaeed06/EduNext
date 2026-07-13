import { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import type { RootState } from '../../features/store'
import courseService, { type DiscussionPost } from '../../services/courseService'
import Button from './Button'

interface Props {
  courseId: string
  lectureId?: string
  courseSlug: string
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
        className="bg-bg-surface border border-border-color rounded-card shadow-xl p-6 max-w-sm w-full mx-4"
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

function PostItem({
  post,
  onDelete,
  onReply,
  userId,
}: {
  post: DiscussionPost
  onDelete: (id: string) => void
  onReply: (parentId: string, content: string) => Promise<void>
  userId?: string
}) {
  const [replyOpen, setReplyOpen] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const handleReply = async () => {
    if (!replyText.trim()) return
    setSubmitting(true)
    try {
      await onReply(post._id, replyText)
      setReplyText('')
      setReplyOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteConfirmed = () => {
    if (deleteTarget) {
      onDelete(deleteTarget)
      setDeleteTarget(null)
    }
  }

  const timeAgo = (iso: string) => {
    const d = new Date(iso)
    const diff = Math.floor((Date.now() - d.getTime()) / 1000)
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return d.toLocaleDateString()
  }

  return (
    <>
      <DeleteConfirmModal
        open={deleteTarget !== null}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirmed}
      />

      <div className="border-b border-border-color last:border-0 py-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-trail-green/10 flex items-center justify-center text-trail-green text-small font-medium shrink-0">
            {post.author.name.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            {/* Author row */}
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-small font-medium text-ink-primary">{post.author.name}</span>
              {post.isInstructorReply && (
                <span className="text-micro bg-trail-amber/10 text-trail-amber px-2 py-0.5 rounded-pill">Instructor</span>
              )}
              <span className="text-micro text-ink-muted">{timeAgo(post.createdAt)}</span>
              {userId === post.author._id && (
                <button
                  onClick={() => setDeleteTarget(post._id)}
                  title="Delete post"
                  className="ml-auto text-ink-muted hover:text-error-clay transition-colors p-1 rounded"
                  aria-label="Delete post"
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Content */}
            <p className="text-small text-ink-primary whitespace-pre-wrap">{post.content}</p>

            {/* Replies */}
            {post.replies?.length > 0 && (
              <div className="mt-3 pl-4 border-l-2 border-border-color space-y-3">
                {post.replies.map((reply) => (
                  <div key={reply._id} className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-signal-blue/10 flex items-center justify-center text-signal-blue text-micro font-medium shrink-0">
                      {reply.author.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-small font-medium text-ink-primary">{reply.author.name}</span>
                        {reply.isInstructorReply && (
                          <span className="text-micro bg-trail-amber/10 text-trail-amber px-2 py-0.5 rounded-pill">Instructor</span>
                        )}
                        <span className="text-micro text-ink-muted">{timeAgo(reply.createdAt)}</span>
                        {userId === reply.author._id && (
                          <button
                            onClick={() => setDeleteTarget(reply._id)}
                            title="Delete reply"
                            className="ml-auto text-ink-muted hover:text-error-clay transition-colors p-1 rounded"
                            aria-label="Delete reply"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <p className="text-small text-ink-primary whitespace-pre-wrap">{reply.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Reply toggle — always visible on every post */}
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={() => setReplyOpen((o) => !o)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-micro font-medium border transition-all duration-150 ${
                  replyOpen
                    ? 'bg-trail-green/10 border-trail-green/30 text-trail-green'
                    : 'bg-bg-surface-alt border-border-color text-ink-muted hover:border-trail-green hover:text-trail-green hover:bg-trail-green/5'
                }`}
              >
                {replyOpen ? (
                  <>
                    <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Cancel
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Reply
                  </>
                )}
              </button>
              {post.replies?.length > 0 && (
                <span className="text-micro text-ink-muted">
                  {post.replies.length} {post.replies.length === 1 ? 'reply' : 'replies'}
                </span>
              )}
            </div>

            {/* Reply form */}
            <AnimatePresence>
              {replyOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 overflow-hidden"
                >
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a reply…"
                    rows={2}
                    className="w-full px-3 py-2 rounded-btn border border-border-color bg-bg-surface text-small text-ink-primary focus:outline-none focus:border-trail-green focus:ring-1 focus:ring-trail-green resize-none"
                    maxLength={2000}
                    autoFocus
                  />
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-micro text-ink-muted">{replyText.length}/2000</span>
                    <Button size="sm" isLoading={submitting} onClick={handleReply} disabled={!replyText.trim()}>
                      Post reply
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  )
}

export default function DiscussionPanel({ courseId, lectureId }: Props) {
  const { user } = useSelector((s: RootState) => s.auth)
  const [posts, setPosts] = useState<DiscussionPost[]>([])
  const [loading, setLoading] = useState(true)
  const [newPost, setNewPost] = useState('')
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

  const handlePost = async () => {
    if (!newPost.trim()) return
    setSubmitting(true)
    setError('')
    try {
      const { post } = await courseService.createDiscussionPost(courseId, {
        content: newPost,
        lectureId,
      })
      setPosts((prev) => [{ ...post, replies: [] }, ...prev])
      setNewPost('')
    } catch {
      setError('Failed to post. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReply = async (parentPostId: string, content: string) => {
    const { post } = await courseService.createDiscussionPost(courseId, {
      content,
      lectureId,
      parentPostId,
    })
    setPosts((prev) =>
      prev.map((p) =>
        p._id === parentPostId ? { ...p, replies: [...(p.replies || []), post] } : p,
      ),
    )
  }

  const handleDelete = async (postId: string) => {
    try {
      await courseService.deleteDiscussionPost(postId)
      setPosts((prev) =>
        prev
          .filter((p) => p._id !== postId)
          .map((p) => ({ ...p, replies: p.replies.filter((r) => r._id !== postId) })),
      )
    } catch {
      setError('Failed to delete post')
    }
  }

  return (
    <div>
      <h3 className="font-display text-heading text-ink-primary mb-4">
        {lectureId ? 'Lecture Q&A' : 'Course Q&A'}
      </h3>

      {/* New post form */}
      {user ? (
        <div className="mb-6">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Ask a question or share a thought…"
            rows={3}
            className="w-full px-3 py-2 rounded-btn border border-border-color bg-bg-surface text-small text-ink-primary focus:outline-none focus:border-trail-green focus:ring-1 focus:ring-trail-green resize-none"
            maxLength={2000}
          />
          {error && <p className="text-small text-error-clay mt-1">{error}</p>}
          <div className="flex items-center justify-between mt-2">
            <span className="text-micro text-ink-muted">{newPost.length}/2000</span>
            <Button size="sm" isLoading={submitting} onClick={handlePost} disabled={!newPost.trim()}>
              Post question
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-small text-ink-muted mb-4">Sign in to ask questions.</p>
      )}

      {/* Posts list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <div key={i} className="h-16 bg-bg-surface-alt rounded-card animate-pulse" />)}
        </div>
      ) : posts.length === 0 ? (
        <p className="text-small text-ink-muted text-center py-8">
          No questions yet — be the first to ask!
        </p>
      ) : (
        <div>
          {posts.map((post) => (
            <PostItem
              key={post._id}
              post={post}
              onDelete={handleDelete}
              onReply={handleReply}
              userId={user?._id}
            />
          ))}
        </div>
      )}
    </div>
  )
}
