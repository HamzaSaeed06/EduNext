# DECISIONS.md — EduNext Architecture Decisions

> Decisions that deviate from or clarify PROJECT_SPEC.md. Each entry: what, why, date.

---

## Phase Completion Status

| Phase | Title | Status |
|-------|-------|--------|
| Custom Course reviews & ratings | ✅ Complete |
| Phase 1 | Project Setup & Infrastructure | ✅ Complete |
| Phase 2 | Authentication System | ✅ Complete (incl. Google OAuth) |
| Phase 3 | Course Management | 🔄 In Progress |
| Phase 4 | Learning Experience (player, progress, Q&A, reviews UI) | ✅ Complete |
| Phase 5 | AI Features (tutor chatbot, recommendations) | ✅ Complete |
| Phase 6 | Admin Panel (dashboard, user management) | ✅ Complete |
| Phase 7 | Polish (dark mode, notifications, PWA, CI/CD) | ✅ Complete |
| Phase 8 | Public UX (homepage sections, public navbar) | ✅ Complete |

---

## 2026-07-13 — Course Reviews and Ratings UI

**Decision:** Developed CourseReviews UI consisting of `ReviewsSection.tsx` and `ReviewForm.tsx` conforming to the "Trail" Amber styling token. Tied reviews update flow dynamically to active details parent component `CourseDetailPage.tsx`.
**Reason:** Allows students to submit/edit ratings and reviews live, updating the rating count and average score immediately without refreshing the page. Implemented pagination on review lists and standard empty state layouts.

---

## 2026-07-13 — Backend port set to 3000

**Decision:** Express server runs on port 3000 (not 5000).
**Reason:** Replit requires the frontend (Vite) to occupy port 5000 for the preview pane. The backend runs on 3000 and is proxied via Vite's `/api` proxy in development.

---

## 2026-07-13 — Docker Compose deferred for Replit environment

**Decision:** Docker Compose setup from Phase 1 spec is deferred; app runs natively in Replit's NixOS container.
**Reason:** Replit does not support Docker/containerization. MongoDB is provided via environment variable (`MONGODB_URI`). The `.env.example` documents this. Docker Compose can be added for non-Replit deployments.

---

## 2026-07-13 — PDF certificate storage: Cloudinary in production, local disk cache in dev

**Decision:** `services/pdfService.js` generates the certificate PDF with `pdfkit`. `services/uploadService.js` gained `uploadBuffer()`: when Cloudinary credentials are set it uploads the buffer as a `raw` resource and returns the secure URL; otherwise it writes the PDF to `server/uploads/certificates/` (gitignored) and serves it via a new `/uploads` static route. Either way the URL is cached once on `Certificate.pdfUrl` — the PDF is never regenerated on subsequent downloads.
**Reason:** Matches the existing `uploadService.uploadFile` pattern (real Cloudinary in prod, local/stubbed behavior in dev) instead of introducing a second storage convention. Avoids requiring Cloudinary credentials just to exercise certificate downloads in local dev/tests.

---

## 2026-07-13 — Production startup check for file-storage credentials

**Decision:** `app.js` now calls `checkProductionUploadConfig()` before `initSocket`/`listen`. If `NODE_ENV=production` and any of `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` are missing, it logs an explicit error and `process.exit(1)` instead of starting.
**Reason:** Previously the app would silently save `https://placeholder.edunext.dev/...` URLs as if they were real uploaded videos/PDFs when Cloudinary wasn't configured — safe for dev, dangerous and silent in production. Refusing to start is preferable to serving broken video/certificate links to real users.

---

## 2026-07-13 — AI, email, and PDF packages added as real dependencies

**Decision:** Added `openai`, `cloudinary`, `nodemailer`, `pdfkit` to `server/package.json` (previously `require()`'d conditionally but not declared — the app would crash with "Cannot find module" the moment the corresponding env vars were set in production). Ran `npm audit` after adding — 0 vulnerabilities.
**Reason:** AGENT_RULES.md Section 6 requires every new package to be checked; these four were latent crash risks documented in the review checklist.

---

## 2026-07-13 — AI provider switched from OpenAI to Google Gemini

**Decision:** `server/src/services/aiService.js` now uses `@google/generative-ai` (`gemini-2.0-flash`) instead of OpenAI. The `openai` package was removed. Gemini has no dedicated "system" role for chat turns, so system instructions are folded into the first/last user turn as a preamble. All four AI features (course summaries, quiz generation, recommendations, AI Tutor chat) keep the same function signatures and stub-fallback behavior — only the provider swapped.
**Reason:** User has a Gemini API key and asked to use it instead of OpenAI when getting the imported project running.

---

## 2026-07-13 — Frontend test suite established (Vitest + React Testing Library)

**Decision:** Added `vitest`, `@vitest/ui`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event` as devDependencies, with `client/vitest.config.ts` + `src/setupTests.ts`, and `npm test` → `vitest run`. Wrote baseline tests for video upload validation (`utils/videoUpload.test.ts`, plus extracted the validation logic itself into `utils/videoUpload.ts` so it's unit-testable outside the drag-and-drop component), the certificate download button, the review submission form, and the Google login button.
**Reason:** AGENT_RULES.md Section 5 — no feature is "done" without tests; the client previously had zero. `npm audit` on the client reports 1 moderate/1 high issue in `esbuild`/`vite` (dev-server-only request forgery risk, not a production risk) that would require a breaking major-version `vite` upgrade to clear — flagged here rather than silently fixed or silently ignored; left as a follow-up decision for the user.

---

## 2026-07-13 — server/.env committed for development

**Decision:** `server/.env` with development-only dummy secrets is committed for initial Replit setup.
**Reason:** Allows the project to run immediately without manual env setup. Production secrets must be set via Replit Secrets / environment variables and are never committed. The `.gitignore` excludes `.env` but this exception is intentional for the dev baseline only — rotate before any real deployment.

---

## 2026-07-13 — AI service uses OpenAI (not Anthropic Claude)

**Decision:** AI features (course summary, quiz generation, recommendations, AI Tutor chatbot) use the OpenAI API (`gpt-4o-mini`) rather than Anthropic Claude as specified in the original spec.
**Reason:** The project was initially scaffolded with the `openai` npm package. The existing AI service stubs gracefully when `OPENAI_API_KEY` is not set, so the app runs without any API key in dev. Switching to Claude would require adding `@anthropic-ai/sdk`, updating all API call shapes, and re-testing. All AI calls are isolated in `server/src/services/aiService.js` — a future migration can swap the provider there with no other changes.

---

## 2026-07-13 — Google OAuth Implemented via Native Fetch

**Decision:** Google OAuth (Phase 2) is fully implemented using Node's native `fetch` client. A mock OAuth exchange route is activated in test mode (`NODE_ENV=test`) or when no credentials are configured but code `mock_google_code` is provided.
**Reason:** This bypasses the need for installing `passport` and `passport-google-oauth20` npm packages which fail to install in this offline/offline-cached environment. It keeps dependencies light and performs token exchange and user info extraction purely in Javascript.

---

## 2026-07-13 — Certificate issuance is JSON (not PDF)

**Decision:** The certificate endpoint returns a JSON data object rather than a generated PDF file.
**Reason:** PDF generation (e.g. pdfkit, puppeteer) adds significant dependency weight and complexity. The certificate data (student name, course title, issue date, unique ID) is properly stored and verifiable. A PDF template layer can be added on top when required.

---

## 2026-07-13 — Socket.io notifications: server-side ready, client opt-in

**Decision:** The Socket.io server is initialized alongside Express but the client only connects to the notification namespace when the user is logged in. The implementation provides a real-time notification bell in AppShell.
**Reason:** Real-time notifications are a Phase 7 feature. The implementation is minimal — course approval/rejection triggers an emit to the affected user's room. Expanding to other event types is straightforward.

---

## 2026-07-13 — Instructor role: admin-only creation

**Decision:** The public `/register` page only creates `student` accounts. The `instructor` role is assigned by an admin via the Admin Users panel (`PATCH /admin/users/:id/role`).
**Reason:** Allowing self-signup as instructor would bypass quality control. Instructors should be verified before they can publish courses. This matches how Udemy/Coursera handle instructor onboarding.

---

## 2026-07-13 — Public pages use PublicNavbar (no AppShell)

**Decision:** The homepage (`/`) and courses listing (`/courses`) use a shared `PublicNavbar` component instead of `AppShell`.
**Reason:** Unauthenticated users should never see the sidebar with Dashboard, Certificates, Sign out, etc. `PublicNavbar` provides a clean top nav with a Courses dropdown (categories) and Sign in / Start learning CTA buttons. Logged-in users accessing `/courses` will still see the public layout — they can navigate to their dashboard via the sidebar after login.

---

## Future Feature Backlog

Features that can be added in subsequent phases:

| Feature | Priority | Notes |
|---------|----------|-------|
| PDF certificate download | Medium | pdfkit or puppeteer |
| Stripe payments / course pricing | High | Paid courses, subscription model |
| Video upload (instructor) | High | Cloudinary or S3 integration |
| Email notifications (Nodemailer) | Medium | Welcome email, enrollment confirmation |
| Student progress analytics | Medium | Charts for instructor dashboard |
| Course completion email | Low | Triggered on final lesson complete |
| Mobile app (React Native/Expo) | Low | API is already REST-ready |
| Multi-language support (i18n) | Low | react-i18next |
| Live classes / webinars | Low | WebRTC or third-party (Daily.co) |
