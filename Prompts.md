You are joining an existing production project called EduNext, an
AI-powered e-learning platform (MERN stack). You have zero prior context
— do not assume anything about what exists yet.

Before doing anything else:
1. Read PROJECT_SPEC.md fully — this defines the product, tech stack,
   features, phases, and testing requirements.
2. Read AGENT_RULES.md fully — this defines coding standards, folder
   structure, and conventions you must follow exactly.
3. Read DESIGN_SYSTEM.md fully — this defines the visual identity
   (colors, type, the "Trail" signature element). Follow it exactly for
   any UI work, no exceptions or improvisation.
4. Inspect the actual current codebase (folder structure, git log,
   package.json files) to determine what has already been built.
5. Summarize back to me: what phase (per PROJECT_SPEC.md Section 7) the
   project is currently at, what's done, and what's next — before
   writing any code.

Do not start implementing until you've completed steps 1-5 and I've
confirmed your understanding is correct.


1. Resume / Continue Work Prompt

Har naye session mein use karein jab project already progress mein ho:

Read PROJECT_SPEC.md, AGENT_RULES.md, and DESIGN_SYSTEM.md fully. Check
the current codebase against the phase checklist in PROJECT_SPEC.md
Section 7 — verify by inspecting actual files/routes/components, not by
assuming. Tell me exactly which phase we're in, what's complete, and
what's left in that phase. Then continue implementing the next
incomplete task, following AGENT_RULES.md conventions and
DESIGN_SYSTEM.md tokens throughout.


2. Full Autonomous Build Prompt

Agar chahte hain agent poora project khud phase-by-phase complete kare:

Read PROJECT_SPEC.md, AGENT_RULES.md, and DESIGN_SYSTEM.md fully.
Implement this project end-to-end, one phase at a time, in the exact
order given in PROJECT_SPEC.md Section 7. After finishing each phase:
run the relevant tests from Section 9, report a pass/fail summary, and
only then move to the next phase. Follow every rule in AGENT_RULES.md
and every design token in DESIGN_SYSTEM.md without exception. If
something is genuinely ambiguous and no safe production-grade default
exists, stop and ask me — otherwise pick the sensible default, note it
in DECISIONS.md, and keep going.


3. Phase-by-Phase Prompts

Phase 1 — Foundation

Read PROJECT_SPEC.md, AGENT_RULES.md, and DESIGN_SYSTEM.md. Implement
Phase 1 (Foundation) from PROJECT_SPEC.md Section 7: set up the folder
structure exactly as in Section 6, initialize the client (Vite + React
+ Tailwind, with DESIGN_SYSTEM.md tokens wired into tailwind.config.js)
and server (Express) apps, configure Docker Compose with MongoDB, and
set up Helmet/CORS/rate-limiting per AGENT_RULES.md Section 6. Define
the core Mongoose models (User, Course, Section, Lecture, Enrollment,
Quiz, Certificate). Write basic tests confirming the server boots and
connects to MongoDB. Do not proceed to Phase 2 until this is complete
and tested.

Phase 2 — Authentication

Read PROJECT_SPEC.md, AGENT_RULES.md, and DESIGN_SYSTEM.md. Implement
Phase 2 (Auth) from PROJECT_SPEC.md Section 4.1: register/login/logout,
JWT access + refresh token flow, Google OAuth, email verification,
forgot/reset password, and role-based middleware (student/instructor/
admin). Follow AGENT_RULES.md API response format and security rules
exactly (bcrypt, httpOnly cookies, rate-limited auth routes). Build the
matching auth UI screens using DESIGN_SYSTEM.md tokens. Write tests per
PROJECT_SPEC.md Section 9.1 (register, login, invalid login, token
refresh, protected route rejection).

Phase 3 — Course Management

Read PROJECT_SPEC.md, AGENT_RULES.md, and DESIGN_SYSTEM.md. Implement
Phase 3 (Course Management) from PROJECT_SPEC.md Section 4.2: instructor
course builder (sections → lectures), video/PDF upload to Cloudinary/S3
with file-type/size validation, course status workflow (draft → pending
review → published), and public course listing with search/filter. Use
the card-based layout from DESIGN_SYSTEM.md Section 4, with the mini
trail indicator on each course card. Write tests per Section 9.1
(course CRUD permissions, file upload rejection cases).

Phase 4 — Learning Experience

Read PROJECT_SPEC.md, AGENT_RULES.md, and DESIGN_SYSTEM.md. Implement
Phase 4 (Learning Experience) from PROJECT_SPEC.md Section 4.3: video
player with resume-from-last-position, per-lecture and per-course
progress tracking, MCQ quizzes with auto-grading, assignment file
submission, auto-generated PDF certificates, and course Q&A/discussion.
Build the full-size trail progress indicator (DESIGN_SYSTEM.md Section
5) on the course detail page and student dashboard. Write tests per
Section 9.1 (quiz scoring edge cases) and 9.2 (video resume position).

Phase 5 — AI Features

Read PROJECT_SPEC.md, AGENT_RULES.md, and DESIGN_SYSTEM.md. Implement
Phase 5 (AI Features) from PROJECT_SPEC.md Section 4.4: AI course
recommendations (based on enrollment/activity/quiz performance), an
AI doubt-solving chatbot scoped to the student's current course/lecture,
AI auto quiz generation for instructors from lecture content, and an AI
course/lecture summary generator. Route all Claude API calls through a
single services/aiService.js per AGENT_RULES.md Section 3. Sanitize all
AI output before rendering. Use --signal-blue exclusively for AI UI per
DESIGN_SYSTEM.md, and clearly label the chatbot as "AI Tutor." Rate-limit
AI endpoints separately from other routes. Write tests confirming AI
endpoints reject abuse (rate limiting) and sanitize output correctly.

Phase 6 — Admin & Instructor Dashboards

Read PROJECT_SPEC.md, AGENT_RULES.md, and DESIGN_SYSTEM.md. Implement
Phase 6 from PROJECT_SPEC.md Section 4.6-4.7: admin panel (user
management, course approval workflow, platform-wide analytics) and
instructor panel (per-course analytics, Q&A moderation). Use the
sidebar-nav dashboard layout from DESIGN_SYSTEM.md Section 4. Enforce
strict role-based access — write a test confirming a student account
cannot reach any admin/instructor-only route (role escalation check).

Phase 7 — Polish & Production Readiness

Read PROJECT_SPEC.md, AGENT_RULES.md, and DESIGN_SYSTEM.md. Implement
Phase 7 from PROJECT_SPEC.md Section 4.5 and Section 7: real-time
notifications (Socket.io) and email notifications, dark/light mode using
the dark-mode tokens in DESIGN_SYSTEM.md Section 2, a full responsive
pass on every screen, PWA setup, and the complete test suite (unit +
integration + E2E per Section 9). Run npm audit and fix any high/critical
vulnerabilities. Set up the GitHub Actions CI pipeline. Confirm every
item in PROJECT_SPEC.md Section 10 (Definition of Done) before reporting
this phase complete.


4. Testing-Only Prompt

Kisi bhi phase ke baad sirf test check karwane ke liye:

Read PROJECT_SPEC.md Section 9 and AGENT_RULES.md Section 5. Run all
applicable tests for the current phase's code (write any that are
missing). Report results as a pass/fail table. Fix any failing tests
before considering this phase complete. Also run npm audit and report
any high/critical vulnerabilities that need fixing.


5. Design-Only Review Prompt

Jab UI ban chuki ho aur design consistency check karwani ho:

Read DESIGN_SYSTEM.md fully. Review every screen built so far against
it: confirm only defined color tokens are used (no hardcoded hex),
confirm the trail signature element replaces plain progress bars
everywhere, confirm --trail-amber and --signal-blue are never mixed as
competing CTAs on the same screen, and confirm the page doesn't match
any of the generic "AI-generated" looks listed in Section 9. Flag and
fix any violations you find.


6. Bug-Fix / Feature-Add Prompt (Template)

Chhoti si change ya bug fix ke liye — [ ] mein apni detail bharen:

Read PROJECT_SPEC.md, AGENT_RULES.md, and DESIGN_SYSTEM.md for context.

Task: [describe the bug or feature here]

Follow existing folder structure and conventions from AGENT_RULES.md.
If this touches UI, use DESIGN_SYSTEM.md tokens only. Add/update tests
covering this change before considering it done.


How to Use This File


Rakhen ye file PROMPTS.md naam se project root mein, baaki teen files (PROJECT_SPEC.md, AGENT_RULES.md, DESIGN_SYSTEM.md) ke saath.
Naye agent/session ke start mein Section 0 (Onboarding Prompt) se shuru karein — agar agent ko project ka bilkul pata nahi.
Agar project already chal raha hai, seedha Section 1 (Resume Prompt) use karein.
Ek phase pe kaam karna ho to uska specific prompt (Section 3) use karein.
Phase complete hone ke baad Section 4 (Testing-Only) aur Section 5 (Design Review) dono chala lein, phir agle phase pe jayein.