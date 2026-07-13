import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import LoadingSpinner from './components/ui/LoadingSpinner'

const HomePage = lazy(() => import('./pages/HomePage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
