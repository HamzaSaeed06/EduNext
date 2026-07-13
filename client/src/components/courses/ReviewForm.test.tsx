import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ReviewForm from './ReviewForm'
import courseService from '../../services/courseService'

vi.mock('../../services/courseService', () => ({
  default: {
    createCourseReview: vi.fn(),
    deleteCourseReview: vi.fn(),
  },
}))

describe('ReviewForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('blocks submission and shows a validation error when no star rating is selected', async () => {
    const onReviewSubmitted = vi.fn()
    render(<ReviewForm slug="test-course" onReviewSubmitted={onReviewSubmitted} />)

    fireEvent.click(screen.getByRole('button', { name: /submit review/i }))

    expect(await screen.findByText(/please select a star rating/i)).toBeInTheDocument()
    expect(courseService.createCourseReview).not.toHaveBeenCalled()
    expect(onReviewSubmitted).not.toHaveBeenCalled()
  })

  it('submits the rating and comment, then calls onReviewSubmitted', async () => {
    ;(courseService.createCourseReview as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)
    const onReviewSubmitted = vi.fn()
    render(<ReviewForm slug="test-course" onReviewSubmitted={onReviewSubmitted} />)

    fireEvent.click(screen.getByRole('button', { name: /rate 4 stars/i }))
    fireEvent.change(screen.getByLabelText(/review comment/i), { target: { value: 'Great course!' } })
    fireEvent.click(screen.getByRole('button', { name: /submit review/i }))

    await waitFor(() => {
      expect(courseService.createCourseReview).toHaveBeenCalledWith('test-course', {
        rating: 4,
        comment: 'Great course!',
      })
    })
    expect(onReviewSubmitted).toHaveBeenCalled()
  })

  it('shows an error message when submission fails', async () => {
    ;(courseService.createCourseReview as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'))
    render(<ReviewForm slug="test-course" onReviewSubmitted={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: /rate 5 stars/i }))
    fireEvent.click(screen.getByRole('button', { name: /submit review/i }))

    expect(await screen.findByText(/network error/i)).toBeInTheDocument()
  })
})
