# EduNext Project Specification

## Platform Overview

**EduNext** is a MERN-stack e-learning platform supporting three distinct user roles with separate feature sets and dashboards.

### Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS v3, Vite
- **Backend**: Node.js/Express, MongoDB
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **Real-time**: Socket.io
- **Icons**: Lucide React
- **Charts**: (To be determined - no charting lib currently in package.json)

### User Roles

#### 1. Student
**Primary Workflows:**
- Browse and enroll in courses
- Watch video lessons
- Complete quizzes
- Track progress and earn certificates
- Chat with instructors (AI chatbot integration planned)
- View and manage certificates

**Key Pages:**
- Dashboard (progress overview)
- Browse courses (/courses)
- Course detail view
- Course player (lesson + quiz)
- My certificates
- Profile/settings

#### 2. Instructor
**Primary Workflows:**
- Create and manage courses
- Build course curriculum
- View student engagement analytics
- Monitor quiz performance
- Create course content

**Key Pages:**
- Dashboard (student engagement overview)
- My courses (course management)
- Course builder (new course)
- Course editor (edit existing)
- Analytics (enrollment, completion, engagement trends)
- Profile/settings

#### 3. Admin
**Primary Workflows:**
- Monitor platform-wide metrics
- Manage users (students, instructors)
- Manage all courses (approve, feature, etc.)
- View platform analytics (growth, revenue if applicable)

**Key Pages:**
- Dashboard (platform overview)
- Manage users
- Manage courses
- Platform analytics
- Settings

### Public Routes (No Auth Required)
- Home page (/) - Landing/marketing
- Login (/login)
- Register (/register)
- Forgot password (/forgot-password)
- Reset password (/reset-password)
- Verify email (/verify-email)
- Browse courses (/courses)
- Course detail (/courses/:slug)
- Certificate verification (/certificates/verify/:certId)

### Protected Routes (Auth Required)

**Student Role:**
- /dashboard (student dashboard)
- /courses/:slug/learn (course player)
- /my-certificates
- /profile (if exists)

**Instructor Role:**
- /dashboard (instructor dashboard)
- /instructor/courses
- /instructor/courses/new
- /instructor/courses/:id/edit
- /instructor/analytics
- /profile (if exists)

**Admin Role:**
- /admin (admin dashboard)
- /admin/courses
- /admin/users
- /admin/analytics (if separate)
- /profile (if exists)

**Multi-role:**
- /courses (all authenticated users)

### Database Schema (Conceptual)

**Users**
- _id, email, password_hash, first_name, last_name, role (student|instructor|admin), avatar, bio, created_at, updated_at

**Courses**
- _id, title, slug, description, instructor_id, category, level, thumbnail, price, status (draft|published|archived), created_at, updated_at, enrollment_count

**Lessons**
- _id, course_id, title, content, video_url, order, created_at, updated_at

**Quizzes**
- _id, lesson_id, title, questions (array), passing_score, created_at

**Enrollments**
- _id, user_id, course_id, enrollment_date, progress (%), completion_date, status (active|completed|dropped)

**Certificates**
- _id, user_id, course_id, issued_date, credential_id, verification_code, is_valid

**Analytics** (aggregated or real-time computed)
- Enrollment trends, completion rates, engagement metrics, quiz performance

## Current Known Issues

1. **Generic UI**: Pages look AI-templated, inconsistent spacing/typography
2. **No real data visualization**: Dashboards show hardcoded/placeholder numbers
3. **Missing backend endpoints**: No aggregation routes for chart data
4. **Inconsistent components**: Button, Card, Input styles not unified
5. **No micro-interactions**: No loading states, empty states, error boundaries on many pages
6. **Responsive issues**: Some pages may not be mobile-optimized
7. **No charting library**: Analytics pages exist but have no charts

## Implementation Priorities

1. **Global layer** (shared components, design tokens, theme)
2. **Dashboards** (all three roles)
3. **Core flow pages** (auth, course listing, course detail, player)
4. **Secondary pages** (certificates, empty/error states, settings)

---

**Status**: In Progress (UI/UX pass)
**Target**: Production-grade visual consistency, real data wiring, full accessibility
