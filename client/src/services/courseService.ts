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

  async getMyEnrollments(): Promise<{ enrollments: Array<{ _id: string; course: Course; progress: number; isCompleted: boolean }> }> {
    const res = await api.get('/courses/student/enrollments')
    return res.data.data
  },
}

export default courseService
