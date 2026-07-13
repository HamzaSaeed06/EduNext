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

  const timeAgo = (iso: string) => {
    const d = new Date(iso)
    const diff = Math.floor((Date.now() - d.getTime()) / 1000)
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return d.toLocaleDateString()
  }

  return (
    <div className="border-b border-border-color last:border-0 py-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-trail-green/10 flex items-center justify-center text-trail-green text-small font-medium shrink-0">
          {post.author.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-small font-medium text-ink-primary">{post.author.name}</span>
            {post.isInstructorReply && (
              <span className="text-micro bg-trail-amber/10 text-trail-amber px-2 py-0.5 rounded-pill">Instructor</span>
            )}
            <span className="text-micro text-ink-muted">{timeAgo(post.createdAt)}</span>
            {userId === post.author._id && (
              <button
                onClick={() => onDelete(post._id)}
                className="text-micro text-error-clay hover:underline ml-auto"
              >
                Delete
              </button>
            )}
          </div>
          <p className="text-small text-ink-primary whitespace-pre-wrap">{post.content}</p>
          <button
            onClick={() => setReplyOpen((o) => !o)}
            className="text-micro text-ink-muted hover:text-trail-green mt-2 transition-colors"
          >
            {replyOpen ? 'Cancel' : 'Reply'}
          </button>

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
                          onClick={() => onDelete(reply._id)}
                          className="text-micro text-error-clay hover:underline ml-auto"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    <p className="text-small text-ink-primary whitespace-pre-wrap">{reply.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reply form */}
          <AnimatePresence>
            {replyOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 overflow-hidden"
              >
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply…"
                  rows={2}
                  className="w-full px-3 py-2 rounded-btn border border-border-color bg-bg-surface text-small text-ink-primary focus:outline-none focus:border-trail-green focus:ring-1 focus:ring-trail-green resize-none"
                  maxLength={2000}
                />
                <Button size="sm" className="mt-2" isLoading={submitting} onClick={handleReply} disabled={!replyText.trim()}>
                  Post reply
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
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
