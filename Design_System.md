# 🎨 DESIGN_SYSTEM.md — EduNext Visual Identity

> This is a binding design spec, not inspiration. Every screen built for EduNext must derive its colors, type, and layout from this document. No hardcoded one-off styles. The goal: a platform that looks like *nobody else's* e-learning site — not another cream-and-serif template, not another black-with-neon-accent dashboard.

---

## 1. The Concept — "The Trail"

E-learning is usually visualized as a progress bar — a flat, boring, forgettable metaphor. EduNext's visual identity is instead built around **wayfinding: learning as a trail you walk, with markers along the way.**

- A course is a **trail** with **checkpoints** (lectures/sections).
- Progress isn't a percentage bar — it's a **trail line that fills in with color** as the student advances, like a hiking route tracked on a map.
- Completed courses leave a **badge/marker** — like a trail flag planted at a summit.
- This metaphor is used consistently: course cards, the student dashboard, even the certificate design.

This is the **signature element**: a hand-drawn-style winding path (SVG) that fills from muted grey to trail-green as progress increases. It appears on course cards (mini version) and full-size on the course detail page and dashboard.

---

## 2. Color Palette

Cool, paper-adjacent neutral base (not the generic warm-cream #F4F1EA look) with a forest/trail-inspired accent system.

| Token | Hex | Usage |
|---|---|---|
| `--bg-base` | `#F6F7F3` | Page background — pale sage-white, not cream |
| `--bg-surface` | `#FFFFFF` | Cards, panels |
| `--bg-surface-alt` | `#EDEFE8` | Secondary panels, hover states |
| `--ink-primary` | `#182620` | Body text — deep forest-black, not pure #000 |
| `--ink-muted` | `#5A6B60` | Secondary text, captions |
| `--border` | `#DADFD3` | Dividers, card borders |
| `--trail-green` | `#2F6F4E` | Progress fill, success states, "completed" markers |
| `--trail-amber` | `#E2A03E` | Primary CTA, in-progress markers, highlights (like a trail blaze) |
| `--signal-blue` | `#3556D9` | AI features exclusively (chatbot, recommendations) — keeps AI visually distinct from course progress |
| `--error-clay` | `#B5482F` | Errors, destructive actions |

**Dark mode** (not an inverted default — purpose-built):
| Token | Hex |
|---|---|
| `--bg-base-dark` | `#141B16` |
| `--bg-surface-dark` | `#1C251F` |
| `--ink-primary-dark` | `#EAEFE7` |
| `--trail-green-dark` | `#4FA173` |
| `--trail-amber-dark` | `#F0B65C` |
| `--signal-blue-dark` | `#6C87F0` |

**Rule:** `--trail-amber` is the ONLY warm accent used for primary actions/CTAs. `--signal-blue` is reserved exclusively for AI-related UI so users always recognize "this is the AI talking" at a glance. Never mix the two in the same component.

---

## 3. Typography

| Role | Typeface | Notes |
|---|---|---|
| Display (headlines, hero) | **Fraunces** (variable, use optical size + soft weight) | Characterful serif with a slight "carved/organic" feel — echoes trail markers and wood signposts. Used sparingly: H1/H2 only. |
| Body | **Inter** | Clean, highly legible at small sizes for lesson text, UI labels |
| Utility/data | **IBM Plex Mono** | Timestamps, progress %, code snippets (if any), certificate IDs |

**Type scale** (rem, 16px base):
- Display XL: 3.5rem / 1.05 — landing hero only
- Display L: 2.25rem / 1.1 — page titles
- Heading: 1.5rem / 1.3 — section headers
- Body: 1rem / 1.6 — default reading text
- Small: 0.875rem / 1.5 — captions, meta info
- Micro (mono): 0.75rem / 1.4 — timestamps, IDs

**Rule:** Fraunces is used with restraint — never for full paragraphs, never for UI chrome (buttons, nav). It marks the moments that matter (hero headline, course title, "Certificate of Completion").

---

## 4. Layout Principles

- **12-column grid**, generous gutters (24px desktop, 16px mobile).
- Card-based layout for course browsing, NOT a dense table/list — courses are visual, image-forward.
- Dashboard uses a **left sidebar nav** (collapsible) + main content — standard for productivity apps, which is correct here since students return daily; don't reinvent this pattern just to be different.
- Border radius: `12px` for cards, `8px` for buttons/inputs, `999px` (pill) only for tags/badges. Consistent — no mixing radius scales.
- Shadows: soft, low-opacity (`0 2px 12px rgba(24,38,32,0.06)`) — no harsh drop shadows.

---

## 5. The Signature Element in Practice

**Trail progress indicator** (replaces plain progress bars everywhere):
- SVG path with a slight hand-drawn wobble (not a perfectly straight/geometric line)
- Unfilled segment: `--border` grey, 3px stroke, dashed
- Filled segment: `--trail-green`, 3px stroke, solid, animates filling in on progress update (400ms ease-out)
- Checkpoint dots at each lecture boundary — filled circle = complete, outlined circle = upcoming, pulsing outline = current

Used on:
- Course card (mini trail, bottom of card)
- Course detail page (full trail down the left side, lecture list follows it)
- Student dashboard ("Your Trails" section instead of "My Courses")
- Certificate (a small trail icon with a flag at the end, next to the completion seal)

---

## 6. Motion Guidelines

- **Page load:** subtle fade + 8px upward slide on main content (200ms) — no more.
- **Trail fill animation:** the one "hero" animation of the product — used when progress updates. Give this room to be satisfying; don't clutter the rest of the UI with competing motion.
- **Hover states:** cards lift 2px with shadow increase (150ms) — no rotation/scale gimmicks.
- **Respect `prefers-reduced-motion`** — disable trail-fill animation and page transitions, keep instant state changes.
- No scroll-jacking, no parallax for its own sake.

---

## 7. Component Voice (Copy Guidelines)

- Buttons say what happens: "Start course," "Submit quiz," "Download certificate" — never "Submit" or "Go" alone.
- Empty states are invitations, not apologies: e.g. empty dashboard says *"No trails started yet — browse courses to begin your first one,"* not "You have no data."
- Errors state what happened and how to fix it, in plain language: *"That file is over 50MB. Try a smaller version or compress it first."* — never "Error 413."
- AI chatbot responses are labeled clearly (avatar + "AI Tutor" label) so it's never confused with an instructor's real reply.

---

## 8. Accessibility Floor (non-negotiable)

- Color contrast ≥ WCAG AA for all text (verify `--ink-muted` on `--bg-base` specifically — borderline, test it)
- All interactive elements keyboard-navigable, visible focus ring using `--signal-blue` at 2px offset outline
- All images have meaningful `alt` text; decorative SVGs (trail lines) marked `aria-hidden`
- Video player has captions support built in from day one, not bolted on later

---

## 9. What NOT to Do

- ❌ No warm cream (#F4F1EA-ish) + high-contrast serif + terracotta accent combo — this is the generic "AI-generated" template look.
- ❌ No near-black background with single neon accent — the generic "tech dashboard" default.
- ❌ No numbered-marker sections (01 / 02 / 03) unless the content is a genuine literal sequence.
- ❌ No stock-photo hero images of "diverse students smiling at laptops" — use the trail/progress visual language instead, or real course content thumbnails.
- ❌ No mixing `--trail-amber` and `--signal-blue` as competing CTAs on the same screen.

---

## 10. Prompt for Agents (Design Work)

```
Read DESIGN_SYSTEM.md fully before building any UI. Use only the tokens
defined here — no hardcoded hex values, no invented type scale. Every
progress indicator must use the trail signature element, not a plain
progress bar. Keep --trail-amber for primary actions and --signal-blue
exclusively for AI features. Before showing me a screen, self-check it
against Section 9 (what NOT to do) and confirm it doesn't match a
generic template look.
```