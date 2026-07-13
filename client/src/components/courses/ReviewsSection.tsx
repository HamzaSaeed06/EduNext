import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import Card from '../ui/Card'
import Button from '../ui/Button'
import ReviewForm from './ReviewForm'
import courseService from '../../services/courseService'
import type { RootState } from '../../features/store'

interface ReviewsSectionProps {
    slug: string
    enrolled: boolean
    courseId: string
}

interface Review {
    id: string
    student: { _id: string; name: string; avatar?: string }
    rating: number
    comment: string
    createdAt: string
}

interface ReviewsSummary {
    averageRating: number
    ratingCount: number
    breakdown: Record<number, number>
}

export default function ReviewsSection({ slug, enrolled }: ReviewsSectionProps) {
    const { user } = useSelector((s: RootState) => s.auth)

    const [reviews, setReviews] = useState<Review[]>([])
    const [summary, setSummary] = useState<ReviewsSummary | null>(null)
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    const [showForm, setShowForm] = useState(false)
    const [isEditing, setIsEditing] = useState(false)

    // Fetch reviews and summary
    const fetchData = async () => {
        try {
            const [reviewsData, summaryData] = await Promise.all([
                courseService.getCourseReviews(slug, page),
                courseService.getCourseReviewsSummary(slug),
            ])
            setReviews(reviewsData.reviews)
            setTotalPages(reviewsData.pagination.pages)
            setSummary(summaryData)
        } catch (err) {
            console.error('Failed to load reviews:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [slug, page])

    // Check if current user has already reviewed the course
    const myReview = user ? reviews.find((r) => r.student && r.student._id === user._id) : null

    const handleReviewSubmitted = () => {
        setShowForm(false)
        setIsEditing(false)
        setPage(1)
        fetchData()
    }

    if (loading && page === 1) {
        return (
            <div className="space-y-4 animate-pulse mt-8">
                <div className="h-6 bg-bg-surface-alt rounded-btn w-32" />
                <div className="h-20 bg-bg-surface-alt rounded-btn w-full" />
            </div>
        )
    }

    const ratingCount = summary?.ratingCount || 0
    const averageRating = summary?.averageRating || 0
    const breakdown = summary?.breakdown || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }

    return (
        <div className="mt-12 space-y-8">
            <div className="border-t border-border pt-8">
                <h3 className="font-display text-heading text-ink-primary mb-6">Student Reviews</h3>

                {/* Rating Overview and Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-bg-surface border border-border rounded-card p-6 mb-8">
                    <div className="flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-border pb-6 md:pb-0">
                        <p className="text-display-l font-display text-ink-primary">{averageRating.toFixed(1)}</p>
                        <div className="flex gap-1 my-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                    key={star}
                                    className={`w-5 h-5 ${star <= Math.round(averageRating) ? 'text-trail-amber' : 'text-border-color'}`}
                                    fill={star <= Math.round(averageRating) ? 'currentColor' : 'none'}
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
                            ))}
                        </div>
                        <p className="text-small text-ink-muted">{ratingCount} review{ratingCount !== 1 ? 's' : ''}</p>
                    </div>

                    <div className="md:col-span-2 flex flex-col justify-center space-y-2">
                        {[5, 4, 3, 2, 1].map((stars) => {
                            const count = breakdown[stars] || 0
                            const percentage = ratingCount > 0 ? (count / ratingCount) * 100 : 0
                            return (
                                <div key={stars} className="flex items-center gap-3">
                                    <span className="text-small text-ink-muted w-3 font-mono">{stars}</span>
                                    <svg className="w-4 h-4 text-trail-amber" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    <div className="flex-1 h-2.5 bg-bg-surface-alt rounded-pill overflow-hidden">
                                        <div
                                            className="h-full bg-trail-amber transition-all duration-300"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <span className="text-small text-ink-muted w-8 text-right font-mono">{Math.round(percentage)}%</span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Review Form Mount Point */}
                {enrolled && (
                    <div className="mb-8">
                        {!showForm && !isEditing ? (
                            myReview ? (
                                <div className="bg-bg-surface-alt border border-border p-4 rounded-card flex justify-between items-center">
                                    <div>
                                        <h5 className="text-small font-medium text-ink-primary">You reviewed this course</h5>
                                        <p className="text-micro text-ink-muted">You rated this {myReview.rating} stars</p>
                                    </div>
                                    <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
                                        Edit Review
                                    </Button>
                                </div>
                            ) : (
                                <Button variant="secondary" onClick={() => setShowForm(true)}>
                                    Write a Review
                                </Button>
                            )
                        ) : (
                            <ReviewForm
                                slug={slug}
                                isEditing={isEditing}
                                initialRating={myReview?.rating || null}
                                initialComment={myReview?.comment || ''}
                                onReviewSubmitted={handleReviewSubmitted}
                                onCancel={() => {
                                    setShowForm(false)
                                    setIsEditing(false)
                                }}
                            />
                        )}
                    </div>
                )}

                {/* Reviews List */}
                {reviews.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-border rounded-card bg-bg-surface">
                        <p className="text-body text-ink-muted">No reviews yet — be the first to share your experience.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reviews.map((rev) => (
                            <Card key={rev.id} className="p-5">
                                <div className="flex justify-between items-start gap-4 mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-pill bg-bg-surface-alt flex items-center justify-center text-small font-medium text-ink-primary uppercase border border-border overflow-hidden">
                                            {rev.student?.avatar ? (
                                                <img src={rev.student.avatar} alt={rev.student.name} className="w-full h-full object-cover" />
                                            ) : (
                                                rev.student?.name?.charAt(0) || 'S'
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="text-small font-medium text-ink-primary leading-tight">
                                                {rev.student?.name || 'Student'}
                                            </h4>
                                            <span className="text-micro text-ink-muted font-mono">
                                                {new Date(rev.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-0.5">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <svg
                                                key={star}
                                                className={`w-4 h-4 ${star <= rev.rating ? 'text-trail-amber' : 'text-border-color'}`}
                                                fill={star <= rev.rating ? 'currentColor' : 'none'}
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
                                        ))}
                                    </div>
                                </div>
                                {rev.comment && <p className="text-body text-ink-muted leading-relaxed mt-2 whitespace-pre-wrap">{rev.comment}</p>}
                            </Card>
                        ))}
                    </div>
                )}

                {/* Pagination buttons */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-8">
                        <Button
                            variant="secondary"
                            size="sm"
                            disabled={page <= 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                        >
                            Previous
                        </Button>
                        <span className="text-small text-ink-muted">
                            Page <span className="font-mono text-ink-primary font-medium">{page}</span> of{' '}
                            <span className="font-mono text-ink-primary font-medium">{totalPages}</span>
                        </span>
                        <Button
                            variant="secondary"
                            size="sm"
                            disabled={page >= totalPages}
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
