import api from './api'

export interface Course {
  _id: string
  title: string
  slug: string
  description: string
  thumbnail: string | null
  category: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  status: 'draft' | 'pending_review' | 'published' | 'rejected'
  enrollmentCount: number
  averageRating: number
  instructor: { _id: string; name: string; avatar?: string }
  tags: string[]
  totalDuration: number
  aiSummary?: string | null
}

export interface Section {
  _id: string
  title: string
  order: number
  lectures: Lecture[]
}

export interface Lecture {
  _id: string
  title: string
  type: 'video' | 'pdf' | 'quiz' | 'text'
  duration: number
  order: number
  isFree: boolean
  contentUrl?: string
}

export interface LectureProgress {
  lecture: string
  completed: boolean
  lastPosition: number
  watchedSeconds: number
  completedAt: string | null
}

export interface Enrollment {
  _id: string
  course: Course
  progress: number
  isCompleted: boolean
  completedLectures: LectureProgress[]
  rating?: number | null
  review?: string | null
}

export interface DiscussionPost {
  _id: string
  course: string
  lecture: string | null
  author: { _id: string; name: string; avatar?: string; role: string }
  content: string
  parentPost: string | null
  isInstructorReply: boolean
  replies: DiscussionPost[]
  createdAt: string
}

export interface CoursesQuery {
  page?: number
  limit?: number
  category?: string
  level?: string
  sort?: 'newest' | 'rating' | 'popular'
  search?: string
}

const courseService = {
  async getCourses(query: CoursesQuery = {}): Promise<{ courses: Course[]; pagination: { total: number; page: number; pages: number } }> {
    const params = new URLSearchParams()
    Object.entries(query).forEach(([k, v]) => { if (v !== undefined) params.set(k, String(v)) })
    const res = await api.get(`/courses?${params.toString()}`)
    return res.data.data
  },

  async getCourse(slug: string): Promise<{ course: Course; sections: Section[] }> {
    const res = await api.get(`/courses/${slug}`)
    return res.data.data
  },

  async createCourse(data: Pick<Course, 'title' | 'description' | 'category' | 'level'> & { tags?: string[] }): Promise<{ course: Course }> {
    const res = await api.post('/courses', data)
    return res.data.data
  },

  async updateCourse(id: string, data: Partial<Course>): Promise<{ course: Course }> {
    const res = await api.patch(`/courses/${id}`, data)
    return res.data.data
  },

  async deleteCourse(id: string): Promise<void> {
    await api.delete(`/courses/${id}`)
  },

  async submitCourse(id: string): Promise<{ course: Course }> {
    const res = await api.post(`/courses/${id}/submit`)
    return res.data.data
  },

  async getInstructorCourses(): Promise<{ courses: Course[] }> {
    const res = await api.get('/courses/instructor/mine')
    return res.data.data
  },

  async enrollCourse(slug: string): Promise<void> {
    await api.post(`/courses/${slug}/enroll`)
  },

  async unenrollCourse(slug: string): Promise<void> {
    await api.delete(`/courses/${slug}/enroll`)
  },

  async getMyEnrollments(): Promise<{ enrollments: Enrollment[] }> {
    const res = await api.get('/courses/student/enrollments')
    return res.data.data
  },

  async updateProgress(enrollmentId: string, data: {
    lectureId: string
    completed?: boolean
    lastPosition?: number
    watchedSeconds?: number
  }): Promise<{ progress: number; isCompleted: boolean }> {
    const res = await api.patch(`/courses/enrollments/${enrollmentId}/progress`, data)
    return res.data.data
  },

  async getDiscussions(courseId: string, lectureId?: string, page = 1): Promise<{ posts: DiscussionPost[]; total: number }> {
    const params = new URLSearchParams({ page: String(page) })
    if (lectureId) params.set('lectureId', lectureId)
    const res = await api.get(`/courses/${courseId}/discussions?${params.toString()}`)
    return res.data.data
  },

  async createDiscussionPost(courseId: string, data: {
    content: string
    lectureId?: string
    parentPostId?: string
  }): Promise<{ post: DiscussionPost }> {
    const res = await api.post(`/courses/${courseId}/discussions`, data)
    return res.data.data
  },

  async deleteDiscussionPost(postId: string): Promise<void> {
    await api.delete(`/discussions/${postId}`)
  },

  async getCourseReviews(slug: string, page = 1, limit = 10): Promise<{
    reviews: Array<{
      id: string
      student: { _id: string; name: string; avatar?: string }
      rating: number
      comment: string
      createdAt: string
    }>
    pagination: { total: number; page: number; limit: number; pages: number }
  }> {
    const res = await api.get(`/courses/${slug}/reviews?page=${page}&limit=${limit}`)
    return res.data.data
  },

  async getCourseReviewsSummary(slug: string): Promise<{
    averageRating: number
    ratingCount: number
    breakdown: Record<number, number>
  }> {
    const res = await api.get(`/courses/${slug}/reviews/summary`)
    return res.data.data
  },

  async createCourseReview(slug: string, data: { rating: number; comment: string }): Promise<void> {
    await api.post(`/courses/${slug}/reviews`, data)
  },

  async deleteCourseReview(slug: string): Promise<void> {
    await api.delete(`/courses/${slug}/reviews`)
  },

  async aiChat(data: {
    courseId: string
    lectureId?: string
    message: string
    history?: Array<{ role: 'user' | 'assistant'; content: string }>
  }): Promise<{ reply: string }> {
    const res = await api.post('/ai/chat', data)
    return res.data.data
  },
}

export default courseService
