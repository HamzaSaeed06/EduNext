import { useState, FormEvent } from 'react'
import Button from '../ui/Button'
import courseService from '../../services/courseService'

interface ReviewFormProps {
    slug: string
    onReviewSubmitted: () => void
    initialRating?: number | null
    initialComment?: string | null
    onCancel?: () => void
    isEditing?: boolean
}

export default function ReviewForm({
    slug,
    onReviewSubmitted,
    initialRating = null,
    initialComment = '',
    onCancel,
    isEditing = false,
}: ReviewFormProps) {
    const [rating, setRating] = useState<number | null>(initialRating)
    const [hoverRating, setHoverRating] = useState<number | null>(null)
    const [comment, setComment] = useState(initialComment || '')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        if (!rating) {
            setError('Please select a star rating')
            return
        }
        setLoading(true)
        setError('')

        try {
            await courseService.createCourseReview(slug, {
                rating,
                comment,
            })
            onReviewSubmitted()
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to submit review')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete your review?')) return
        setLoading(true)
        setError('')
        try {
            await courseService.deleteCourseReview(slug)
            onReviewSubmitted()
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to delete review')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="bg-bg-surface-alt rounded-card p-6 border border-border">
            <h4 className="font-display text-subheading text-ink-primary mb-4">
                {isEditing ? 'Update Your Review' : 'Write a Review'}
            </h4>

            {error && (
                <div className="bg-error-clay/10 text-error-clay text-small p-3 rounded-btn mb-4 border border-error-clay/20">
                    {error}
                </div>
            )}

            {/* Star Selector */}
            <div className="mb-4">
                <label className="block text-small font-medium text-ink-primary mb-2">
                    Your Rating <span className="text-error-clay">*</span>
                </label>
                <div className="flex gap-1.5" onMouseLeave={() => setHoverRating(null)}>
                    {[1, 2, 3, 4, 5].map((star) => {
                        const active = hoverRating !== null ? star <= hoverRating : rating !== null && star <= rating
                        return (
                            <button
                                key={star}
                                type="button"
                                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-blue rounded-pill p-1 transition-transform hover:scale-110"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                            >
                                <svg
                                    className={`w-8 h-8 ${active ? 'text-trail-amber' : 'text-border-color'}`}
                                    fill={active ? 'currentColor' : 'none'}
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.969 0 1.371 1.24.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.97-2.883a1 1 0 00-1.175 0l-3.97 2.883c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118l-3.97-2.883c-.783-.57-.38-1.81.588-1.81h4.907a1 1 0 00.95-.69l1.519-4.674z"
                                    />
                                </svg>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Review Comment Textarea */}
            <div className="mb-6">
                <label htmlFor="course-review-comment" className="block text-small font-medium text-ink-primary mb-2">
                    Review Comment
                </label>
                <textarea
                    id="course-review-comment"
                    rows={4}
                    maxLength={2000}
                    className="w-full bg-bg-surface border border-border rounded-btn p-3 text-body text-ink-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trail-amber"
                    placeholder="What did you think of the course content, explanations, and pacing?"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />
                <div className="flex justify-between items-center mt-1 text-micro text-ink-muted">
                    <span>Be constructive in your review.</span>
                    <span>{comment.length} / 2000</span>
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
                <Button type="submit" isLoading={loading} variant="primary">
                    {isEditing ? 'Save Review' : 'Submit Review'}
                </Button>
                {isEditing && (
                    <Button type="button" variant="danger" disabled={loading} onClick={handleDelete}>
                        Delete Review
                    </Button>
                )}
                {onCancel && (
                    <Button type="button" variant="ghost" disabled={loading} onClick={onCancel}>
                        Cancel
                    </Button>
                )}
            </div>
        </form>
    )
}
