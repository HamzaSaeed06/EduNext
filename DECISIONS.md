# DECISIONS.md — EduNext Architecture Decisions

> Decisions that deviate from or clarify PROJECT_SPEC.md. Each entry: what, why, date.

---

## 2026-07-13 — Backend port set to 5001

**Decision:** Express server runs on port 5001 (not 5000).
**Reason:** Replit requires the frontend (Vite) to occupy port 5000 for the preview pane. The backend runs on 5001 and is proxied via Vite's `/api` proxy in development.

---

## 2026-07-13 — Docker Compose deferred for Replit environment

**Decision:** Docker Compose setup from Phase 1 spec is deferred; app runs natively in Replit's NixOS container.
**Reason:** Replit does not support Docker/containerization. MongoDB is provided via environment variable (`MONGODB_URI`). The `.env.example` documents this. Docker Compose can be added for non-Replit deployments.

---

## 2026-07-13 — server/.env committed for development

**Decision:** `server/.env` with development-only dummy secrets is committed for initial Replit setup.
**Reason:** Allows the project to run immediately without manual env setup. Production secrets must be set via Replit Secrets / environment variables and are never committed. The `.gitignore` excludes `.env` but this exception is intentional for the dev baseline only — rotate before any real deployment.
