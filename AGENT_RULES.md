# EduNext UI/UX Pass — Agent Rules

## Scope

This document governs the full UI/UX pass on the EduNext platform. The pass touches every user-facing page, fixes visual design consistency, verifies functionality, and wires real data.

## Process Flow (Mandatory Order)

### Phase 0: Discovery & Planning
1. ✅ Read PROJECT_SPEC.md, DESIGN_SYSTEM.md, AGENT_RULES.md (this file)
2. ✅ Extract all routes from App.tsx and navigation config
3. Create a page audit table (see Phase 1)
4. Share audit with user for prioritization feedback

### Phase 1: Audit (Per-Page Analysis)
For **every single page** in the route list, document:
- **Visual Issues**: Templated design, spacing, typography, hierarchy problems
- **Functional Issues**: Broken forms, dead buttons, silent errors, no loading states
- **Responsive Issues**: Mobile/tablet breakpoints
- **Console Errors**: Network failures, missing data
- **Priority**: High/Med/Low based on user impact

**Deliverable**: Audit table (markdown) listing all pages with issues

**Do NOT skip any page.** If a page is routed, it must be audited.

### Phase 2: Fix Priority Order
Fix in this exact sequence (not random):

1. **Global layer** (once, fixes ~70% of all pages)
   - Theme tokens (colors, spacing, typography scale)
   - Shared components (Navbar, Sidebar, Button, Card, Modal, Input, Badge, etc.)
   - Layout system (grids, containers, flex utilities)

2. **Dashboards** (Student, Instructor, Admin)
   - Visual hierarchy and stat cards
   - Real data wiring (no placeholders)
   - Chart/visualization components
   - Empty states

3. **Core flow pages** (in order of user journey)
   - Auth pages (Login, Register, Reset, Verify)
   - Course listing & detail pages
   - Course player + quiz
   - Student/Instructor onboarding flows

4. **Secondary pages**
   - Certificates and verification
   - Settings/profile (if exists)
   - 404 and error pages
   - Empty and loading states

### Phase 3: Dashboard-Specific Rules

**All dashboards must have:**

#### Top Stat Cards Row
- Replace all static numbers with real backend aggregation
- Each stat card includes a mini sparkline or trend chart (last 7/30 days)
- Example stats:
  - Student: Total courses, In progress, Completed, Time spent
  - Instructor: Active courses, Total students, Enrollment rate, Avg quiz score
  - Admin: Total users, Active courses, Platform growth, Revenue (if applicable)

#### Main Chart Area
- **Student**: Course progress timeline, quiz score trends, time-spent breakdown
- **Instructor**: Enrollment trends per course, completion rates, engagement heatmap
- **Admin**: Platform-wide growth (users, courses, revenue), role distribution, activity

#### Rules for Chart Data
- **No dummy arrays** — every data point pulled from backend
- **Backend aggregation routes** must be created if missing (Express + Mongo aggregation)
- **Empty states**: New users with no data see friendly empty chart (not broken/blank)
- **Real-time or daily refresh**: Charts update when user loads page (or via Socket.io if applicable)

#### Layout
- Grid structure: stat cards → primary chart → secondary widgets → consistent card styling
- All cards use DESIGN_SYSTEM.md spacing/radius/shadow (no mixed styles)

### Phase 4: Visual Design Fixes (Global Application)

#### Typography
- Verify font stack matches DESIGN_SYSTEM.md (Inter for all)
- Apply type scale consistently (H1–H5, Body, Label classes)
- Check line-height (1.4–1.6 for body)
- No random font imports without justification

#### Color Usage
- Primary (`#2563eb`) for main CTAs and highlights only
- Secondary Teal (`#14b8a6`) for progress indicators and trail metaphor
- Accent Gold (`#f59e0b`) for achievements and milestones
- Proper WCAG AA contrast (4.5:1 minimum)
- Use semantic tokens from globals/CSS variables (not hardcoded hex)

#### Spacing
- Adhere to spacing scale (4/8/12/16/24/32px)
- No arbitrary margins/padding (use Tailwind utilities, not `p-[17px]`)
- Consistent gap between layout blocks

#### Avoid Generic AI-Template Look
- No default shadcn card-in-a-grid patterns
- Introduce at least one distinctive layout per major area (per "The Trail" metaphor)
- Personality: Use Hero sections, callouts, and visual hierarchy
- Real content & data (no Lorem Ipsum)

#### Micro-interactions
- Hover states on all interactive elements (opacity: 0.8, scale: 0.98 for buttons)
- Focus indicators (outline 2px) on all inputs/buttons
- Loading skeletons instead of blank/delayed renders
- Subtle transitions (150–250ms, ease-in-out)
- Toast notifications for feedback (not browser alerts)

#### Empty/Error/Loading States
- Every list, table, chart, and feed needs all three states designed
- Not just the happy path
- Friendly empty state copy + illustration
- Error message with recovery action (not silent failures)
- Loading skeleton or spinner (not blank screen)

### Phase 5: Functionality Verification (Per Page)

For every fixed page, verify:
- ✅ All buttons/links route to correct destinations (no dead `onClick={() => {}}`)
- ✅ Forms validate and show real inline error messages
- ✅ API calls have loading + error handling (no infinite spinners, no silent failures)
- ✅ Role-based access respected (Student can't see Admin routes, etc.)
- ✅ Data is live from backend (not hardcoded mock/seed data left in components)
- ✅ Console clean of errors (network, missing data, unhandled promises)

**If a backend endpoint is missing**, create it:
- Use Express + MongoDB aggregation (not client-side fake data)
- Keep it minimal (only what the page needs)
- Document the endpoint in a changelog

### Phase 6: Deliverables

#### 1. Updated Code
- All changed component files
- Global styles/theme updates
- New backend routes (if any)

#### 2. UI_UX_CHANGELOG.md
Include:
- List of pages touched
- Visual changes per page (before → after)
- Functional bugs fixed
- New backend endpoints created
- Design system consistency notes

#### 3. Verification Checklist
- Logo unchanged ✅
- DESIGN_SYSTEM.md colors still used ✅
- No new ad-hoc hex codes ✅
- No Lorem Ipsum left ✅
- All pages audited ✅
- All dashboards have real data + charts ✅
- All pages responsive ✅
- No console errors ✅
- All routes tested ✅

## Hard Rules (Non-Negotiable)

1. **Do NOT redesign the logo** — use existing mark as-is
2. **Do NOT introduce design outside DESIGN_SYSTEM.md** without flagging (e.g., new font, new color theme)
3. **Do NOT fake chart data** — wire to real backend or create aggregation endpoint
4. **Do NOT skip pages** — every route must appear in audit
5. **Do NOT leave TODO, Lorem Ipsum, or placeholder numbers in production UI**
6. **Do NOT break existing functionality** — only enhance and fix
7. **Do NOT add heavy dependencies** (new charting libs, animation libs, etc.) without checking package.json first
8. **Do NOT mix Tailwind utilities** — use semantic class names when available (not `bg-[#abc123]`)

## Tools & Resources

- **CSS Framework**: Tailwind CSS v3 (in package.json)
- **Icons**: Lucide React (already imported throughout)
- **State**: Redux Toolkit (already in use)
- **Charts**: TBD (decide in Phase 2 based on package.json analysis)
- **Validation**: React Hook Form (via existing components)
- **Routing**: React Router v6
- **Real-time**: Socket.io (already imported in some components)

## Communication & Feedback Loop

- Share Phase 1 audit table before making any visual changes
- Ask for role/feature prioritization from user
- Report blocking issues (missing backend endpoints, etc.)
- Provide before/after screenshots for validation
- Document all functional improvements in changelog

---

**Last Updated**: Q3 2025
**Status**: Ready for execution
