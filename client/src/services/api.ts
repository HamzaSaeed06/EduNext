import axios from 'axios'

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
