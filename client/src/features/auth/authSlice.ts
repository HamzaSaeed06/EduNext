import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface User {
  _id: string
  name: string
  email: string
  role: 'student' | 'instructor' | 'admin'
  avatar?: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ user: User; accessToken: string }>) {
      state.user = action.payload.user
      state.accessToken = action.payload.accessToken
      state.isAuthenticated = true
    },
    clearCredentials(state) {
      state.user = null
      state.accessToken = null
      state.isAuthenticated = false
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload
    },
  },
})

export const { setCredentials, clearCredentials, setLoading } = authSlice.actions
export default authSlice.reducer
