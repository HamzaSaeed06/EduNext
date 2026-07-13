import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import LoadingSpinner from './components/ui/LoadingSpinner'
import ProtectedRoute from './components/auth/ProtectedRoute'

const HomePage = lazy(() => import('./pages/HomePage'))
const LoginPage = lazy(() => import('./pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'))
const VerifyEmailPage = lazy(() => import('./pages/auth/VerifyEmailPage'))

const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'))
const CoursesPage = lazy(() => import('./pages/courses/CoursesPage'))
const CourseDetailPage = lazy(() => import('./pages/courses/CourseDetailPage'))
const CoursePlayerPage = lazy(() => import('./pages/courses/CoursePlayerPage'))

const InstructorCoursesPage = lazy(() => import('./pages/instructor/InstructorCoursesPage'))
const CourseBuilderPage = lazy(() => import('./pages/instructor/CourseBuilderPage'))
const CourseEditorPage = lazy(() => import('./pages/instructor/CourseEditorPage'))

const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'))
const AdminCoursesPage = lazy(() => import('./pages/admin/AdminCoursesPage'))
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'))

const CertificatesPage = lazy(() => import('./pages/student/CertificatesPage'))
const CertificateVerifyPage = lazy(() => import('./pages/CertificateVerifyPage'))
const InstructorAnalyticsPage = lazy(() => import('./pages/instructor/InstructorAnalyticsPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:slug" element={<CourseDetailPage />} />

          {/* Student */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/courses/:slug/learn" element={<ProtectedRoute><CoursePlayerPage /></ProtectedRoute>} />
          <Route path="/my-certificates" element={<ProtectedRoute roles={['student']}><CertificatesPage /></ProtectedRoute>} />

          {/* Public cert verification */}
          <Route path="/certificates/verify/:certId" element={<CertificateVerifyPage />} />

          {/* Instructor */}
          <Route path="/instructor/courses" element={<ProtectedRoute roles={['instructor', 'admin']}><InstructorCoursesPage /></ProtectedRoute>} />
          <Route path="/instructor/courses/new" element={<ProtectedRoute roles={['instructor', 'admin']}><CourseBuilderPage /></ProtectedRoute>} />
          <Route path="/instructor/courses/:id/edit" element={<ProtectedRoute roles={['instructor', 'admin']}><CourseEditorPage /></ProtectedRoute>} />
          <Route path="/instructor/analytics" element={<ProtectedRoute roles={['instructor', 'admin']}><InstructorAnalyticsPage /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboardPage /></ProtectedRoute>} />
          <Route path="/admin/courses" element={<ProtectedRoute roles={['admin']}><AdminCoursesPage /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsersPage /></ProtectedRoute>} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
