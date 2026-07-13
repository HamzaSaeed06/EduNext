import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../../features/auth/authSlice'
import themeReducer from '../../features/theme/themeSlice'
import CertificatesPage from './CertificatesPage'
import api from '../../services/api'

function renderPage() {
  const store = configureStore({ reducer: { auth: authReducer, theme: themeReducer } })
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/certificates']}>
        <CertificatesPage />
      </MemoryRouter>
    </Provider>,
  )
}

vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
  },
}))

const mockCertificate = {
  _id: 'cert_db_1',
  certificateId: 'cert-uuid-123',
  courseTitle: 'Intro to Trails',
  instructorName: 'Jane Instructor',
  issuedAt: new Date('2026-01-01').toISOString(),
  course: { title: 'Intro to Trails', slug: 'intro-to-trails', level: 'Beginner' },
}

describe('CertificatesPage — Download certificate button', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
    globalThis.URL.revokeObjectURL = vi.fn()
  })

  it('renders a "Download certificate" button for each earned certificate', async () => {
    ;(api.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { data: { certificates: [mockCertificate] } } })
    renderPage()

    expect(await screen.findByRole('button', { name: /download certificate/i })).toBeInTheDocument()
  })

  it('shows an empty state with no download button when there are no certificates', async () => {
    ;(api.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { data: { certificates: [] } } })
    renderPage()

    expect(await screen.findByText(/no certificates yet/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /download certificate/i })).not.toBeInTheDocument()
  })

  it('fetches the PDF as a blob and triggers a browser download when clicked', async () => {
    ;(api.get as ReturnType<typeof vi.fn>).mockImplementation((url: string) => {
      if (url === '/student/certificates') {
        return Promise.resolve({ data: { data: { certificates: [mockCertificate] } } })
      }
      if (url === `/certificates/${mockCertificate.certificateId}/download`) {
        return Promise.resolve({ data: new Blob(['%PDF-fake'], { type: 'application/pdf' }) })
      }
      return Promise.reject(new Error(`Unexpected URL ${url}`))
    })

    renderPage()
    const downloadButton = await screen.findByRole('button', { name: /download certificate/i })
    fireEvent.click(downloadButton)

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        `/certificates/${mockCertificate.certificateId}/download`,
        { responseType: 'blob' },
      )
    })
    expect(globalThis.URL.createObjectURL).toHaveBeenCalled()
  })
})
