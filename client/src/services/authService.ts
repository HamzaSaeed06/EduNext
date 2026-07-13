import axios from 'axios'
import api from './api'

interface AuthResponse {
  user: {
    _id: string
    name: string
    email: string
    role: 'student' | 'instructor' | 'admin'
    avatar?: string
    isEmailVerified: boolean
  }
  accessToken: string
}

const authService = {
  async register(data: { name: string; email: string; password: string; role: string }): Promise<AuthResponse> {
    const res = await api.post('/auth/register', data)
    return res.data.data
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await api.post('/auth/login', { email, password })
    return res.data.data
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout')
  },

  async refreshToken(): Promise<{ accessToken: string }> {
    // Use plain axios (not the interceptor-wrapped api) so that a 401 here
    // does NOT trigger the interceptor's retry/redirect loop.
    const res = await axios.post('/api/v1/auth/refresh-token', {}, { withCredentials: true })
    return res.data.data
  },

  async getMe(): Promise<AuthResponse['user']> {
    const res = await api.get('/auth/me')
    return res.data.data.user
  },

  async verifyEmail(token: string): Promise<void> {
    await api.post('/auth/verify-email', { token })
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email })
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await api.post('/auth/reset-password', { token, password })
  },
}

export default authService
