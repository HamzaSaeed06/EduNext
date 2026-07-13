# 🤖 AGENT_RULES.md — EduNext Coding Standards

> Read this alongside `PROJECT_SPEC.md` and `DESIGN_SYSTEM.md` before writing any code. This file defines *how* to write code on this project so that every agent session — no matter which one — produces consistent, production-grade output. Treat these as hard rules, not suggestions.

---

## 1. General Principles

- **Consistency over cleverness.** Match existing patterns in the codebase before introducing new ones.
- **No placeholder/fake code.** Never write `// TODO: implement later` and move on — either implement it or explicitly flag it to the user as a decision point.
- **No silent scope-cutting.** If something in `PROJECT_SPEC.md` can't be built as specified, say so and propose an alternative — don't quietly simplify and pretend it's done.
- **Small, reviewable units of work.** Prefer completing one feature/route/component fully (with tests) over touching many files shallowly.
- **Re-read before you edit.** Always view a file's current state immediately before editing it — never edit from memory of an earlier turn.

---

## 2. Git & Commit Rules

- Conventional commits: `feat:`, `fix:`, `refactor:`, `test:`, `chore:`, `docs:`, `style:`, `perf:`
- One logical change per commit. Don't bundle unrelated features.
- Never commit `.env`, `node_modules`, build artifacts, or credentials.
- Branch naming: `feature/<name>`, `fix/<name>`, `chore/<name>`
- Never commit local run-output files (e.g. redirected `npm run build`/`npm test` output like `build_output.txt`, `tsc_errors.txt`, `test_output.txt`). They leak local machine paths and add no value in version control — pipe command output to your terminal/agent transcript instead, or to a gitignored scratch file.

---

## 3. Backend Rules (Node/Express)

### Structure
- Controllers stay thin — business logic goes in `services/`, not controllers.
- One Mongoose model per file in `models/`, PascalCase filenames (`User.js`, `Course.js`).
- Routes only wire up middleware + controller — no logic in route files.

### API Conventions
- REST routes: `/api/v1/<resource>` (versioned from day one).
- Consistent JSON response shape:
```json
{ "success": true, "data": {}, "message": "" }
{ "success": false, "error": { "code": "", "message": "" } }
```
- Use proper HTTP status codes (400 validation, 401 unauth, 403 forbidden, 404 not found, 409 conflict, 500 server error). Never return 200 for an error.
- All routes that mutate data require auth middleware unless explicitly public.
- Every input-accepting route MUST have a validator (express-validator schema) before it touches the controller.

### Error Handling
- Centralized error-handling middleware — controllers throw/pass errors via `next(err)`, never send raw try/catch responses inline everywhere.
- Never leak stack traces or internal error details to the client in production.
- Every async controller wrapped (e.g. `asyncHandler`) — no unhandled promise rejections.

### Database
- No business logic in Mongoose middleware unless it's data-integrity related (e.g. password hashing pre-save).
- Indexes defined explicitly for frequently queried fields (`email`, `courseId`, `slug`).
- Soft-delete pattern (`isDeleted` flag) for Users/Courses instead of hard delete, to preserve referential integrity.

### AI Service Layer
- All Claude API calls go through a single `services/aiService.js` — never call the AI API directly from controllers.
- AI responses that will be shown to users must be validated/sanitized before rendering (never trust raw model output as safe HTML).
- Rate-limit AI endpoints separately (they're the most expensive to abuse).
- Log AI request/response metadata (not full content) for debugging, never log full prompts containing user PII.

---

## 4. Frontend Rules (React)

### Structure
- Functional components + hooks only. No class components.
- One component per file, PascalCase filename matches component name.
- Co-locate a component's styles/tests with the component, not in a distant folder.
- Shared UI primitives (Button, Input, Card, Modal) live in `components/ui/` and are the ONLY place styling for these elements is defined — no one-off restyled buttons elsewhere.

### State Management
- Server state (courses, user data) → React Query / RTK Query (cached, not manually managed in useState).
- Client/UI state (modals open, theme, form drafts) → Redux Toolkit slice or local state — never mix the two responsibilities.
- No prop-drilling beyond 2 levels — lift to context or state store instead.

### API Calls
- All API calls go through a single `services/api.js` axios instance with interceptors for auth token attach + refresh-on-401.
- Never call `fetch`/`axios` directly inside a component — always through a service/hook.

### Styling
- TailwindCSS utility classes as default. Custom CSS only for things Tailwind can't express (complex animations, the signature design element).
- Design tokens (colors, spacing, type scale) come ONLY from `DESIGN_SYSTEM.md` / `tailwind.config.js` — no hardcoded hex values in components.
- Every interactive element has a visible focus state (accessibility — non-negotiable).

### Performance
- Route-level code splitting (`React.lazy` + `Suspense`) for each major page.
- Images lazy-loaded, served in modern formats (WebP) with proper `alt` text.
- Memoize expensive computations/lists (`useMemo`, `React.memo`) where profiling shows it matters — don't over-memoize prematurely.

---

## 5. Testing Rules

- No feature is "done" without tests. A PR/change without tests is incomplete work, not a shortcut.
- Backend: every route needs at least one success-path and one failure-path test.
- Frontend: every form needs a validation test; every protected route needs an access-control test.
- Run the full test suite before declaring a phase (from `PROJECT_SPEC.md` Section 7) complete.

---

## 6. Security Rules (enforced on every change)

- Never trust client input — validate again server-side even if the frontend already validates.
- Never store secrets in code, comments, or commit history.
- Any new npm package gets a quick check: is it maintained, no known critical CVEs (`npm audit`).
- File uploads: always validate MIME type AND file extension AND size, server-side.
- Any AI-generated content shown to users (chatbot replies, auto-quizzes) must pass through sanitization before render.

---

## 7. Documentation Rules

- Every new module/service gets a short comment block explaining its purpose (not line-by-line comments — comment *why*, not *what*).
- Update `README.md` when setup steps change (new env var, new service dependency).
- If a decision deviates from `PROJECT_SPEC.md`, log it in `DECISIONS.md` with a one-line reason.

---

## 8. Definition of "Done" for Any Task

A task is only complete when ALL of the following are true:
- [ ] Code follows structure/conventions above
- [ ] Tests written and passing
- [ ] No secrets/hardcoded config
- [ ] `npm audit` clean of high/critical issues for any new dependency
- [ ] Matches `DESIGN_SYSTEM.md` tokens exactly (frontend work)
- [ ] Manually reasoned through edge cases (empty states, errors, loading states)
- [ ] Relevant docs updated

---

## 9. Prompt for Agents

```
Read PROJECT_SPEC.md, DESIGN_SYSTEM.md, and AGENT_RULES.md fully before
starting. Follow AGENT_RULES.md for every line of code you write — folder
structure, API response shape, state management pattern, and testing
requirements are not optional. If you're about to deviate from a rule,
stop and tell me why instead of silently doing it your own way.
```