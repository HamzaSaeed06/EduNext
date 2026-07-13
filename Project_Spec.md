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

# 🧩 FEATURE_SPEC_BATCH1.md — Detailed Spec for 5 Features

> This file gives implementation-level detail for 5 specific features referenced from `PROJECT_SPEC.md`. Use alongside `AGENT_RULES.md` (conventions) and `DESIGN_SYSTEM.md` (UI). Current status is noted per feature — agent must verify actual code state, not just trust the status label below (labels may be stale).

---

## 1. Google OAuth (One-Click Login)

**Status:** Not yet started (unless codebase says otherwise — verify)
**Goal:** Student/instructor can sign up or log in with a single click via Google, no separate password needed for that account.

### Requirements
- "Continue with Google" button on both Login and Register screens
- Uses OAuth 2.0 Authorization Code flow (via `passport-google-oauth20` or equivalent)
- On first login via Google: auto-create a User record (role defaults to `student`, upgradeable later)
- If an account with that email already exists (created via normal signup), link the Google account to it instead of creating a duplicate — match by verified email
- Store Google `sub` (unique ID) on the User model to avoid future duplicate-account issues
- Issue the same JWT access + refresh token pair as normal login (Google login is just an alternate entry point into the same auth system, per `AGENT_RULES.md`)

### Data Model Addition (User)
```
googleId: { type: String, unique: true, sparse: true }
authProvider: { type: String, enum: ['local', 'google'], default: 'local' }
```

### API
- `GET /api/v1/auth/google` — redirects to Google consent screen
- `GET /api/v1/auth/google/callback` — handles callback, creates/links user, issues tokens, redirects to frontend with tokens (or sets httpOnly cookie + redirects to dashboard)

### Security Notes
- Verify the Google ID token signature server-side — never trust client-supplied profile data directly
- Only accept verified Google emails (`email_verified: true` from Google's response)
- Google client secret lives only in `.env`, never in frontend code

### Frontend
- Button follows `DESIGN_SYSTEM.md` button component — Google's own logo/branding guidelines apply to the icon, but button shape/spacing matches the rest of the form
- Loading state while redirect/callback resolves

### Tests
- New user via Google creates exactly one User record
- Existing local-auth user logging in via Google links accounts, doesn't duplicate
- Invalid/tampered token from callback is rejected

---

## 2. PDF Certificates (Real Downloadable Certificate)

**Status:** Not yet started (unless codebase says otherwise — verify)
**Goal:** On 100% course completion, student can download an actual PDF certificate — not a placeholder image or static template with no real data.

### Requirements
- Trigger: when a student's course progress hits 100% (all lectures + passing quiz scores where applicable), generate a certificate record
- Certificate contains: student name, course title, instructor name, completion date, unique certificate ID (verifiable), and the trail/flag icon per `DESIGN_SYSTEM.md` Section 5
- Certificate is generated as an actual PDF file (not HTML-to-image screenshot hack) — use a proper PDF library (e.g. `pdfkit` or `puppeteer` server-side rendering from an HTML template)
- Stored in Cloudinary/S3, with the URL saved on the Certificate model — don't regenerate on every download request, generate once and cache
- Public verification page: `/verify/:certificateId` — anyone with the link can confirm a certificate is genuine (shows student name + course + date, not private info)

### Data Model (Certificate)
```
studentId, courseId, certificateId (unique, e.g. nanoid),
issuedAt, pdfUrl, verified: true
```

### API
- `POST /api/v1/certificates/generate` (internal, triggered on completion — not directly user-callable to prevent forging)
- `GET /api/v1/certificates/:certificateId` — fetch certificate metadata
- `GET /api/v1/certificates/:certificateId/download` — serves/redirects to the PDF
- `GET /api/v1/certificates/verify/:certificateId` — public verification endpoint

### Frontend
- "Download Certificate" button appears only when course is 100% complete
- Certificate preview shown in-app before download (styled per `DESIGN_SYSTEM.md`)
- Public verification page is a simple, clean, unauthenticated page

### Tests
- Certificate only generates at true 100% completion (not 99%, not manually forced via API)
- Certificate ID is unique and not guessable/sequential (use nanoid/UUID, not incrementing integers)
- Verification endpoint returns correct data for valid ID, 404 for invalid

---

## 3. Video Upload (Instructor Content Upload)

**Status:** Not yet started (unless codebase says otherwise — verify)
**Goal:** Instructors can upload their own video lectures directly through the platform, with proper validation and processing — not just paste a YouTube link (this is direct file upload).

### Requirements
- Instructor selects a video file when creating/editing a lecture
- Client-side pre-check: file type (mp4, mov, webm) and size limit (e.g. 500MB — confirm limit with product owner) before upload starts, to avoid wasted upload time on invalid files
- Server-side: re-validate MIME type and size regardless of client check (never trust client-side validation alone, per `AGENT_RULES.md` Section 6)
- Upload directly to Cloudinary/S3 (signed upload URL pattern — server generates a signed upload signature, client uploads directly to storage, doesn't proxy the whole file through the Express server)
- Show upload progress bar to the instructor
- After upload completes, store the resulting video URL + duration + thumbnail (auto-generated by Cloudinary) on the Lecture model
- Video should be served via adaptive streaming (HLS) where the storage provider supports it, not just a raw MP4 link, for better playback on slow connections

### Data Model Addition (Lecture)
```
videoUrl, videoDuration, videoThumbnail, uploadStatus: enum['pending','processing','ready','failed']
```

### API
- `POST /api/v1/lectures/:id/upload-signature` — returns a signed upload URL/signature for direct-to-storage upload
- `POST /api/v1/lectures/:id/confirm-upload` — called after client-side upload succeeds, to save the final URL/metadata
- Webhook endpoint (if using Cloudinary's async processing) to update `uploadStatus` when processing finishes

### Security Notes
- Signed upload URLs expire quickly (e.g. 15 minutes) and are scoped to the specific instructor's lecture — can't be reused to upload arbitrary content elsewhere
- Only the owning instructor (or admin) can initiate an upload for a given lecture — enforce via auth middleware
- Rate-limit upload-signature requests to prevent abuse

### Frontend
- Drag-and-drop upload zone (styled per `DESIGN_SYSTEM.md`)
- Progress bar during upload, clear error messages on failure (file too large, wrong format — use plain-language errors per `DESIGN_SYSTEM.md` Section 7)
- Preview player once upload + processing is complete

### Tests
- Oversized file rejected both client-side and server-side
- Wrong file type rejected
- Only the lecture's owning instructor can request an upload signature for it
- Expired signature is rejected by storage provider

---

## 4. Email Notifications (Welcome + Enrollment Confirmation)

**Status:** Not yet started (unless codebase says otherwise — verify)
**Goal:** Automated transactional emails for key user moments, starting with these two:

### 4.1 Welcome Email
- Trigger: successful registration (both local signup and Google OAuth first-time signup)
- Content: greet by name, brief platform intro, link to browse courses, no unnecessary marketing fluff
- Send asynchronously (don't block the registration API response waiting on email send — queue it)

### 4.2 Enrollment Confirmation Email
- Trigger: student successfully enrolls in a course
- Content: course title, instructor name, direct link to start the course, what to expect (number of lectures, estimated duration)

### Requirements (both)
- Use a transactional email service (e.g. Resend, SendGrid, or Nodemailer + SMTP provider) — never a personal SMTP account in production
- HTML email templates should be simple, mobile-friendly, and reflect brand tone from `DESIGN_SYSTEM.md` Section 7 (plain language, clear single CTA button)
- Emails sent via a queue/job (e.g. BullMQ or a simple async service call) so email provider downtime doesn't affect core app response times
- Log email send success/failure (not full email content) for debugging
- Include unsubscribe/preference link even for transactional-adjacent emails as good practice (can be a simple "manage notification preferences" link)

### Data Model Addition (optional, for tracking)
```
EmailLog: { userId, type: enum['welcome','enrollment', ...], sentAt, status: enum['sent','failed'] }
```

### API
- Internal service function, not a public route: `services/emailService.js` → `sendWelcomeEmail(user)`, `sendEnrollmentConfirmation(user, course)`
- Called from the relevant controller (registration controller, enrollment controller) — fire-and-forget via queue, don't await synchronously in the request/response cycle

### Tests
- Registration triggers exactly one welcome email job queued
- Enrollment triggers exactly one enrollment email job queued
- Email service failure doesn't crash or fail the registration/enrollment API call itself (core action succeeds even if email fails)

---

## 5. Course Reviews UI (Backend Ready, Frontend Pending)

**Status:** Backend complete — frontend not yet built. **Agent must verify this by inspecting the actual API routes/controllers before assuming they exist.**

**Goal:** Build the frontend for a review system whose backend already exists. Do not rebuild the backend — confirm its actual contract first (check routes file / run existing endpoint) rather than assuming the shape described below; treat this section as a best-guess reference to verify against, not a rebuild spec.

### Verification Step (do this first)
1. Locate the reviews-related routes/controllers/model in the existing codebase.
2. Confirm the actual request/response shape by reading the code (and/or hitting the endpoint) rather than assuming the shape below.
3. If the actual API differs from what's assumed here, build the frontend against the real contract and update this file to match reality.

### Assumed API Contract (verify against real code)
- `POST /api/v1/courses/:courseId/reviews` — create a review `{ rating: 1-5, comment: string }` (student must be enrolled to submit)
- `GET /api/v1/courses/:courseId/reviews` — paginated list of reviews for a course
- `GET /api/v1/courses/:courseId/reviews/summary` — average rating + count breakdown by star

### Frontend Requirements
- **Course detail page:** average rating (stars) + total review count shown near the course title
- **Reviews section:** paginated list of reviews (student name/avatar, star rating, comment, date)
- **Review submission form:** shown only to enrolled students who haven't already reviewed that course; star selector + comment textarea
- **Edit/delete own review:** a student can edit or remove their own review (confirm this exists in the backend; if not, flag it as a gap rather than silently building UI for a non-existent endpoint)
- Empty state when no reviews yet: inviting copy per `DESIGN_SYSTEM.md` Section 7 (e.g. *"No reviews yet — be the first to share your experience."*)
- Uses `DESIGN_SYSTEM.md` card styling; star rating color uses `--trail-amber`, not an arbitrary yellow

### Tests
- Review form only renders for enrolled students
- Submitting a review updates the average rating display without a full page reload
- Attempting to submit a second review (if backend disallows it) shows a clear error, not a silent failure

---


```

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