import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../../features/auth/authSlice'
import themeReducer from '../../features/theme/themeSlice'
import LoginPage from './LoginPage'

vi.mock('../../services/authService', () => ({
  default: {
    login: vi.fn(),
    getMe: vi.fn(),
  },
}))

function renderLoginPage() {
  const store = configureStore({ reducer: { auth: authReducer, theme: themeReducer } })
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/login']}>
        <LoginPage />
      </MemoryRouter>
    </Provider>,
  )
}

describe('LoginPage — Google login button', () => {
  it('renders a "Continue with Google" button linking to the OAuth entry point', () => {
    renderLoginPage()

    const googleLink = screen.getByRole('link', { name: /continue with google/i })
    expect(googleLink).toBeInTheDocument()
    expect(googleLink).toHaveAttribute('href', '/api/v1/auth/google')
  })

  it('also renders the standard email/password sign-in form alongside it', () => {
    renderLoginPage()

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })
})
