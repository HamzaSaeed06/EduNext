import axios from 'axios'

/**
 * Axios errors carry a generic message like "Request failed with status
 * code 400" on err.message — not helpful to end users and easy to mistake
 * for a raw error code. The backend's errorHandler always puts the
 * user-safe message at err.response.data.error.message (curated text for
 * 4xx, and a generic "Something went wrong" for 500s). Prefer that.
 */
export function getErrorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (axios.isAxiosError(err)) {
    const backendMessage = err.response?.data?.error?.message
    if (typeof backendMessage === 'string' && backendMessage) return backendMessage
    if (!err.response) return 'Unable to reach the server. Please check your connection and try again.'
  }
  if (err instanceof Error && err.message) return err.message
  return fallback
}

const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

let accessToken: string | null = null

export function setAccessToken(token: string | null) {
  accessToken = token
}

api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const { data } = await axios.post('/api/v1/auth/refresh-token', {}, { withCredentials: true })
        accessToken = data.data.accessToken
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api(originalRequest)
      } catch {
        accessToken = null
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export default api
