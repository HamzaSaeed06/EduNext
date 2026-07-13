# 📚 EduNext — AI-Powered E-Learning Platform
### Production Project Specification (v1.0)

> **Purpose of this file:** This document is the single source of truth for this project. Any AI agent (or human developer) picking up this project — for the first time, or resuming work — should read this file top to bottom before writing any code. It defines what the project is, how it must be built, what "done" looks like, and how to test it.

---

## 1. Project Overview

**Name:** EduNext
**Type:** E-Learning Platform (recorded courses, no live classes)
**Business model:** Free platform (no payments/monetization in this version)
**Target:** Production-grade, scalable, secure, modern UI — not a demo/tutorial-level app.

**One-line pitch:** A MERN-stack e-learning platform where instructors upload recorded video courses, students learn at their own pace, and AI powers recommendations, a doubt-solving chatbot, and auto-generated quizzes.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18+ (Vite), TailwindCSS, Framer Motion, Redux Toolkit / Zustand |
| Backend | Node.js + Express.js |
| Database | MongoDB (Mongoose ODM) |
| Auth | JWT (access + refresh tokens), bcrypt, Google OAuth |
| File/Video Storage | Cloudinary or AWS S3 (video + PDF uploads) |
| Video Streaming | HLS / adaptive streaming via Cloudinary or self-hosted with signed URLs |
| Realtime | Socket.io (notifications, chat) |
| AI Layer | Anthropic Claude API (recommendations, chatbot, auto quiz generation) |
| Search | MongoDB Atlas Search or Elasticsearch (optional, for course search) |
| Testing | Jest, Supertest (backend), React Testing Library + Vitest (frontend), Playwright (E2E) |
| DevOps | Docker, Docker Compose, GitHub Actions (CI/CD) |
| Monitoring/Logging | Winston (server logs), Sentry (error tracking) |
| Security | Helmet, express-rate-limit, cors, express-validator, DOMPurify |

---

## 3. User Roles

1. **Student** — browse/enroll courses, watch videos, take quizzes, track progress, get certificate, chat with AI tutor.
2. **Instructor** — create/manage courses, upload video/PDF content, view analytics on their courses, moderate Q&A on their courses.
3. **Admin** — manage all users, approve/reject courses, platform-wide analytics, content moderation.

---

## 4. Core Feature List

### 4.1 Authentication & Users
- Register/login with email+password (bcrypt hashed) and Google OAuth
- JWT access token (short-lived) + refresh token (httpOnly cookie)
- Email verification on signup
- Forgot/reset password flow
- Role-based route protection (student/instructor/admin)
- Profile management (avatar, bio, social links)

### 4.2 Course Management
- Instructor course builder: sections → lectures (video/PDF/quiz)
- Course metadata: title, description, category, tags, thumbnail, difficulty level
- Course status: draft → pending review → published (admin approves)
- Video upload with processing (Cloudinary/S3)
- Course search, filter by category/level, sort by rating/newest

### 4.3 Learning Experience
- Video player with resume-from-last-position, playback speed control
- Progress tracking per lecture and per course (%)
- Quizzes: MCQ, auto-graded, instant feedback
- Assignments with file submission
- Auto-generated certificate (PDF) on 100% course completion
- Course Q&A/discussion section per lecture

### 4.4 AI Features (Full Set)
- **AI Course Recommendations** — based on enrolled courses, browsing history, and quiz performance
- **AI Doubt-Solving Chatbot** — contextual to the course/lecture the student is currently on
- **AI Auto Quiz Generation** — instructor provides lecture content/transcript, AI generates MCQ quiz drafts for review
- **AI Course Summary Generator** — auto-generate short course/lecture summaries for previews

### 4.5 Notifications
- Real-time notifications (Socket.io): new course announcement, quiz graded, Q&A reply, certificate ready
- Email notifications for key events (welcome, course completion)

### 4.6 Admin Panel
- User management (ban/unban, role change)
- Course approval workflow
- Platform analytics (total users, enrollments, active courses, engagement charts)

### 4.7 Instructor Panel
- Per-course analytics (enrollments, completion rate, quiz performance, ratings)
- Student Q&A moderation

### 4.8 UI/UX (Modern, High-Profile)
- Fully responsive, mobile-first
- Dark/light mode toggle
- Skeleton loaders, smooth page transitions (Framer Motion)
- Clean dashboard layouts (student/instructor/admin each distinct)
- Accessible (WCAG basics: keyboard nav, alt text, contrast)
- PWA support (installable, works offline for downloaded content metadata)

---

## 5. Security Requirements (Non-Negotiable)

- All inputs validated & sanitized server-side (express-validator + DOMPurify for rich text)
- Passwords hashed with bcrypt (cost factor ≥ 12)
- JWT secrets, DB URIs, API keys — only in `.env`, never committed (enforce via `.gitignore`)
- Helmet.js for secure HTTP headers
- express-rate-limit on auth routes and AI endpoints (prevent brute force/abuse)
- CORS configured to allow only known origins
- File upload validation (type, size limits) to prevent malicious uploads
- No sensitive data (passwords, tokens) ever logged
- MongoDB queries via Mongoose only — no raw string concatenation (prevents NoSQL injection)
- HTTPS enforced in production (via reverse proxy/hosting config)
- Dependency vulnerability scanning (`npm audit`, Dependabot) as part of CI

---

## 6. Architecture & Folder Structure

```
edunext/
├── client/                      # React frontend
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/                # Route-level pages
│   │   ├── features/             # Redux slices / feature modules
│   │   ├── hooks/
│   │   ├── services/              # API calls (axios instances)
│   │   ├── utils/
│   │   └── App.jsx
│   └── package.json
├── server/                      # Express backend
│   ├── src/
│   │   ├── config/                # DB, cloudinary, env config
│   │   ├── models/                # Mongoose schemas
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middlewares/           # auth, error handler, rate limiter
│   │   ├── services/               # AI service, email service, etc.
│   │   ├── validators/
│   │   └── app.js
│   ├── tests/
│   └── package.json
├── docker-compose.yml
├── .github/workflows/ci.yml
├── .env.example
└── PROJECT_SPEC.md              # ← this file
```

---

## 7. Development Phases (Task Breakdown)

**Phase 1 — Foundation**
- Repo setup, folder structure, Docker Compose (MongoDB + server + client)
- Env config, base Express server with Helmet/CORS/rate-limiting
- Mongoose models: User, Course, Section, Lecture, Enrollment, Quiz, Certificate

**Phase 2 — Auth**
- Register/login/logout, JWT + refresh token flow, Google OAuth
- Email verification, forgot/reset password
- Role-based middleware

**Phase 3 — Course Management**
- Instructor course CRUD + video/PDF upload to Cloudinary/S3
- Course publish workflow (draft → review → published)
- Public course listing, search, filter

**Phase 4 — Learning Experience**
- Video player + progress tracking
- Quiz creation/taking/auto-grading
- Certificate generation (PDF)
- Q&A/discussion module

**Phase 5 — AI Features**
- AI recommendation engine (Claude API + user activity data)
- AI chatbot (context-aware, scoped to current course)
- AI auto quiz generation for instructors
- AI course/lecture summary generator

**Phase 6 — Admin/Instructor Dashboards**
- Admin: user & course management, platform analytics
- Instructor: per-course analytics

**Phase 7 — Polish & Production Readiness**
- Notifications (Socket.io + email)
- Dark/light mode, responsive pass, animations
- PWA setup
- Full test suite (unit + integration + E2E)
- CI/CD pipeline, security audit, load testing basics

---

## 8. Agent Instructions — How to Work On This Project

> Any agent picking up this project must follow this workflow:

1. **Read this file fully first.** Do not start coding before understanding scope, stack, and security rules above.
2. **Check current state** — run `git log`, look at folder structure, check which Phase (Section 7) has been completed. Never assume; verify against actual code.
3. **Work one phase at a time**, in order, unless the user explicitly says otherwise.
4. **Never hardcode secrets.** Always use `.env` + `.env.example`.
5. **Write tests alongside features**, not after — every new route/component should have at least a basic test.
6. **Follow the folder structure in Section 6** — do not create ad-hoc structure.
7. **Before marking a phase "done,"** run the relevant checklist in Section 9 (Testing).
8. **If a requirement is ambiguous, pick the most sensible production-grade default and note the assumption** in a `DECISIONS.md` log — do not block on it.
9. **Update this PROJECT_SPEC.md** if scope changes mid-project (e.g., payments added later) — keep it as the living source of truth.
10. **Security is non-negotiable** — every PR/change must be checked against Section 5 before being considered complete.

### Ready-to-use prompts for the agent

**To start Phase 1:**
```
Read PROJECT_SPEC.md fully. We are starting Phase 1 (Foundation).
Set up the folder structure exactly as defined in Section 6, initialize
client (Vite+React+Tailwind) and server (Express) apps, configure Docker
Compose with MongoDB, and set up Helmet/CORS/rate-limiting on the server.
Do not proceed to Phase 2 until Phase 1 is complete and tested.
```

**To resume/continue work:**
```
Read PROJECT_SPEC.md. Check the current codebase state against the Phase
checklist in Section 7. Tell me which phase we are in and what's left,
then continue implementing the next incomplete task in that phase.
```

**To complete the whole project autonomously:**
```
Read PROJECT_SPEC.md fully. Implement this project end-to-end, phase by
phase, in order, exactly as specified. After each phase, run tests from
Section 9 and report pass/fail before moving to the next phase. Follow
all security requirements in Section 5 without exception. Stop and ask
only if something is truly ambiguous and no safe default exists.
```

**To add a specific feature:**
```
Read PROJECT_SPEC.md for context. Implement [FEATURE NAME] as described
in Section 4. Follow the existing folder structure and security rules.
Add tests for it per Section 9 before considering it done.
```

---

## 9. Testing Checklist

### 9.1 Backend (Jest + Supertest)
- [ ] Auth: register, login, invalid login, token refresh, protected route rejection without token
- [ ] Course CRUD: create/update/delete only by owning instructor or admin
- [ ] Enrollment: student can enroll, cannot double-enroll
- [ ] Quiz: submission scoring is correct, edge cases (no answers, all correct/wrong)
- [ ] File upload: rejects invalid file types/oversized files
- [ ] Rate limiting: exceeding limit returns 429
- [ ] Input validation: SQL/NoSQL injection attempts rejected, XSS payloads sanitized

### 9.2 Frontend (Vitest/RTL)
- [ ] Forms validate required fields client-side
- [ ] Protected routes redirect unauthenticated users
- [ ] Course player resumes at correct timestamp
- [ ] Dark/light mode toggle persists

### 9.3 E2E (Playwright)
- [ ] Full student journey: signup → browse → enroll → watch → quiz → certificate
- [ ] Full instructor journey: signup → create course → upload lecture → publish → view analytics
- [ ] AI chatbot responds contextually within a course
- [ ] AI recommendations appear on dashboard after activity

### 9.4 Security Testing
- [ ] `npm audit` shows no high/critical vulnerabilities
- [ ] Manual check: no secrets in repo (`git grep` for common key patterns)
- [ ] Auth routes tested against brute-force (rate limit works)
- [ ] Role escalation attempt (student hitting admin routes) is blocked

### 9.5 Test prompt for the agent
```
Read PROJECT_SPEC.md Section 9. Run/write all applicable tests for the
current phase's code. Report results as a pass/fail table. Fix any
failing tests before considering this phase complete.
```

---

## 10. Definition of Done (Whole Project)

- All 7 phases in Section 7 complete
- All checklist items in Section 9 passing
- No secrets in repo, `.env.example` present and accurate
- `npm audit` clean of high/critical issues
- Dockerized and runs via `docker-compose up`
- README with setup instructions exists
- CI pipeline (GitHub Actions) runs tests on every push/PR