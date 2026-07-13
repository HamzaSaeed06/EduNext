import { createSlice } from '@reduxjs/toolkit'

interface ThemeState {
  mode: 'light' | 'dark'
}

const stored = localStorage.getItem('theme') as 'light' | 'dark' | null

const initialState: ThemeState = {
  mode: stored ?? 'light',
}

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme(state) {
      state.mode = state.mode === 'light' ? 'dark' : 'light'
      localStorage.setItem('theme', state.mode)
      if (state.mode === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    },
  },
})

export const { toggleTheme } = themeSlice.actions
export default themeSlice.reducer
