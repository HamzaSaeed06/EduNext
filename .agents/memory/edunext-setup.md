---
name: EduNext project setup
description: Key architectural decisions, port config, AI provider, test patterns, and deferred features for the EduNext MERN e-learning platform.
---

## Port config
- Backend: port 3000 (Express + Socket.io via http.createServer)
- Frontend: port 5000 (Vite)
- Vite proxies `/api` → `http://localhost:3000`

## AI provider
- Uses Google Gemini (`gemini-2.0-flash` via `@google/generative-ai`), NOT OpenAI or Anthropic Claude as earlier revisions used.
- All AI calls are isolated in `server/src/services/aiService.js` — swap provider there only.
- Gracefully stubs all AI responses when `GEMINI_API_KEY` is not set.
- Gemini has no "system" role for chat turns — system instructions get folded into the adjacent user turn.

## Database — no native Replit integration
- This is a MERN app (Mongoose/MongoDB), not Replit's built-in Postgres. Replit has no MongoDB connector/integration.
- `MONGODB_URI` must be requested from the user as a secret (e.g. a MongoDB Atlas connection string) — there's no way to provision it in-platform.
- `server/src/config/db.js` connects at startup but doesn't crash the process if it fails (`startServer` catches the error and logs a warning) — the server stays up and serves 200s even with no DB, which can mask a missing/wrong `MONGODB_URI`. Check for "MongoDB connected" in logs or try a real DB-touching request (e.g. register) to confirm it's actually connected.

## Test patterns
- All server tests mock Mongoose models (no real MongoDB).
- Auth middleware mock pattern: `User.findById = jest.fn().mockReturnValue(chainable(user))` where `chainable` returns a Promise with a `.select()` method also attached.
- 7 test suites, 69 tests total.

## Deferred features (documented in DECISIONS.md)
- Google OAuth: `googleId` field in User model exists, no routes. Needs GOOGLE_CLIENT_ID/SECRET.
- Certificate PDF: returns JSON data, not a generated PDF.

## Socket.io
- Server: `server/src/config/socket.js` exports `initSocket(httpServer)`, `getIO()`, `notifyUser(userId, type, msg, data)`.
- `initSocket` is called in `startServer()` only — NOT during tests (`NODE_ENV !== 'test'`).
- Client connects via `useNotifications` hook (dynamic import of socket.io-client).
- Course approval/rejection emits to instructor's user room via `notifyUser`.

**Why:** `app.js` exports just `app` for supertest compatibility. `http.createServer(app)` is the actual server.

## Discussion/Q&A module
- `server/src/models/Discussion.js` → model name `DiscussionPost`
- Routes mounted at `/api/v1` (not `/api/v1/courses`) to allow both course and standalone delete routes.
- GET `/courses/:courseId/discussions`, POST same, DELETE `/discussions/:id`

## Admin routes
- All admin user routes in `server/src/routes/users.js`, mounted at `/api/v1`.
- `GET /admin/stats` returns `{ totalUsers, totalCourses, pendingReview, totalEnrollments }`.

## CORS in the Replit dev preview
- The Replit preview loads the app from a public `https://<id>.<cluster>.replit.dev` origin, not `localhost` — a CORS allowlist that only contains localhost entries (or relies on `CORS_ORIGIN` being manually set to localhost) will reject real preview requests with "Not allowed by CORS", even though curl-from-shell tests against `localhost` pass fine.
- `NODE_ENV` is NOT set by default by the `npm run dev` workflow command here — don't rely on `process.env.NODE_ENV === 'development'` as a CORS bypass or any other dev-only gate; it silently never fires.
- **How to apply:** build the CORS allowlist by merging localhost defaults + any configured `CORS_ORIGIN` + an auto-derived entry from `process.env.REPLIT_DEV_DOMAIN` (`https://${REPLIT_DEV_DOMAIN}` and `:5000` variant), so it self-updates with the workspace's actual domain instead of depending on `NODE_ENV`.

## Sanitizing errors shown to end users
- Two layers are both needed, or raw technical errors leak through even after backend sanitization: (1) server-side, `errorHandler` must always replace 500-level `err.message` with a generic string (not just in production) since third-party provider errors (e.g. Gemini quota/HTTP error JSON) otherwise bubble straight to the client; (2) client-side, code must read `err.response.data.error.message` from the axios error, not `err.message` — axios's own `err.message` is a generic string like "Request failed with status code 400" that never carries the backend's curated message, so using it makes every error unhelpful/generic-looking (which itself reads as "raw code" to non-technical users) even though it isn't technically an information leak.
- **How to apply:** centralize this as a small `getErrorMessage(err, fallback)` helper (checks `axios.isAxiosError`, falls back to network-error copy when `!err.response`) and use it everywhere `catch (err)` sets user-facing error state, instead of ad hoc `err instanceof Error ? err.message : ...`.
