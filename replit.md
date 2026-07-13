# EduNext

An e-learning platform (MERN stack) with AI-powered guidance, video courses, quizzes, real-time notifications, and role-based access for students, instructors, and admins.

## Stack

- **Frontend**: React 18 + Vite, TypeScript, TailwindCSS, Framer Motion, Redux Toolkit — port 5000
- **Backend**: Node.js + Express (CommonJS), Socket.io — port 3000
- **Database**: MongoDB via Mongoose (MongoDB Atlas)
- **AI**: Google Gemini (`gemini-2.0-flash`) — stubs gracefully when `GEMINI_API_KEY` is absent
- **Media**: Cloudinary for video/PDF uploads — falls back to local `/uploads` in dev

## Running on Replit

Two workflows run in parallel:

| Workflow | Command | Port |
|----------|---------|------|
| Backend  | `cd server && npm run dev` | 3000 |
| Frontend | `cd client && npm run dev` | 5000 |

The Vite dev server proxies `/api` → `http://localhost:3000`, so the frontend and backend communicate automatically.

## Required Secrets

| Secret | Purpose |
|--------|---------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_ACCESS_SECRET` | Signs short-lived access tokens |
| `JWT_REFRESH_SECRET` | Signs long-lived refresh tokens |

## Optional Secrets (degrade gracefully without them)

| Secret | Purpose |
|--------|---------|
| `GEMINI_API_KEY` | AI chat, quiz generation, course summaries |
| `CLOUDINARY_CLOUD_NAME` | Video/PDF/image uploads |
| `CLOUDINARY_API_KEY` | Cloudinary auth |
| `CLOUDINARY_API_SECRET` | Cloudinary auth |
| `EMAIL_HOST` / `EMAIL_PORT` / `EMAIL_USER` / `EMAIL_PASS` / `EMAIL_FROM` | Transactional email |

## Project Structure

```
client/   React + Vite frontend
  src/
    features/   Redux slices (auth, theme)
    pages/      Role-based pages (student, instructor, admin)
    components/ Reusable UI / layout / course components
    services/   Axios API wrappers

server/   Express backend
  src/
    config/     db, logger, socket
    controllers/
    models/     Mongoose schemas
    routes/
    middlewares/
    services/   AI (Gemini), email, Cloudinary upload
```

## Not Yet Implemented

- Google OAuth (model field exists, no routes — needs `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`)
- Certificate PDF generation (returns JSON data placeholder)

## User Preferences

<!-- Add user preferences here as they are shared -->
