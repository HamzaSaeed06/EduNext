---
name: EduNext project setup
description: Key architectural decisions, port config, AI provider, test patterns, and deferred features for the EduNext MERN e-learning platform.
---

## Port config
- Backend: port 3000 (Express + Socket.io via http.createServer)
- Frontend: port 5000 (Vite)
- Vite proxies `/api` → `http://localhost:3000`

## AI provider
- Uses OpenAI (`gpt-4o-mini`), NOT Anthropic Claude as the spec originally said.
- All AI calls are isolated in `server/src/services/aiService.js` — swap provider there only.
- Gracefully stubs all AI responses when `OPENAI_API_KEY` is not set.

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
