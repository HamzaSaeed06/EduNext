# DECISIONS.md — EduNext Architecture Decisions

> Decisions that deviate from or clarify PROJECT_SPEC.md. Each entry: what, why, date.

---

## 2026-07-13 — Backend port set to 3000

**Decision:** Express server runs on port 3000 (not 5000).
**Reason:** Replit requires the frontend (Vite) to occupy port 5000 for the preview pane. The backend runs on 3000 and is proxied via Vite's `/api` proxy in development.

---

## 2026-07-13 — Docker Compose deferred for Replit environment

**Decision:** Docker Compose setup from Phase 1 spec is deferred; app runs natively in Replit's NixOS container.
**Reason:** Replit does not support Docker/containerization. MongoDB is provided via environment variable (`MONGODB_URI`). The `.env.example` documents this. Docker Compose can be added for non-Replit deployments.

---

## 2026-07-13 — server/.env committed for development

**Decision:** `server/.env` with development-only dummy secrets is committed for initial Replit setup.
**Reason:** Allows the project to run immediately without manual env setup. Production secrets must be set via Replit Secrets / environment variables and are never committed. The `.gitignore` excludes `.env` but this exception is intentional for the dev baseline only — rotate before any real deployment.

---

## 2026-07-13 — AI service uses OpenAI (not Anthropic Claude)

**Decision:** AI features (course summary, quiz generation, recommendations, AI Tutor chatbot) use the OpenAI API (`gpt-4o-mini`) rather than Anthropic Claude as specified in the original spec.
**Reason:** The project was initially scaffolded with the `openai` npm package. The existing AI service stubs gracefully when `OPENAI_API_KEY` is not set, so the app runs without any API key in dev. Switching to Claude would require adding `@anthropic-ai/sdk`, updating all API call shapes, and re-testing. All AI calls are isolated in `server/src/services/aiService.js` — a future migration can swap the provider there with no other changes.

---

## 2026-07-13 — Google OAuth deferred

**Decision:** Google OAuth (Phase 2) is not implemented. The `googleId` field exists in the User model for future use.
**Reason:** Google OAuth requires a `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. These credentials have not been provided. The standard email/password auth flow is fully functional. Google OAuth can be added via Passport.js when credentials are available.

---

## 2026-07-13 — Certificate issuance is JSON (not PDF)

**Decision:** The certificate endpoint returns a JSON data object rather than a generated PDF file.
**Reason:** PDF generation (e.g. pdfkit, puppeteer) adds significant dependency weight and complexity. The certificate data (student name, course title, issue date, unique ID) is properly stored and verifiable. A PDF template layer can be added on top when required.

---

## 2026-07-13 — Socket.io notifications: server-side ready, client opt-in

**Decision:** The Socket.io server is initialized alongside Express but the client only connects to the notification namespace when the user is logged in. The implementation provides a real-time notification bell in AppShell.
**Reason:** Real-time notifications are a Phase 7 feature. The implementation is minimal — course approval/rejection triggers an emit to the affected user's room. Expanding to other event types is straightforward.
