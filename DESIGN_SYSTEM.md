# EduNext Design System

## Brand Identity - "The Trail"

EduNext uses a learning-journey metaphor called **"The Trail"**. This informs all visual and UX decisions.

### Logo & Mark
- **Primary Logo**: EduNext wordmark with trail icon (mountain path/learning curve)
- **Status**: LOCKED — do not redesign. Keep as-is in all applications.
- **Usage**: Public navbar, login page, branding contexts

### Color System

**Primary Colors:**
- **Accent (Primary)**: `#2563eb` (Tailwind blue-600) - Main CTAs, highlights, active states
- **Brand Teal** (Secondary): `#14b8a6` (Tailwind teal-500) - Trail metaphor, progress indicators
- **Gold** (Tertiary): `#f59e0b` (Tailwind amber-500) - Achievements, milestones, certificates

**Neutral Palette:**
- **Dark BG**: `#1a1a1a` (Near-black) - Dark mode primary bg
- **Light BG**: `#fafafa` (Off-white) - Light mode primary bg
- **Surface**: `#ffffff` (White) - Cards, modals, surfaces
- **Surface Dark**: `#2a2a2a` - Dark mode card/surface
- **Text Primary**: `#0f172a` (Slate-900) - Main text
- **Text Secondary**: `#64748b` (Slate-500) - Secondary text
- **Border**: `#e2e8f0` (Slate-200) - Borders, dividers
- **Border Dark**: `#404040` - Dark mode borders

**Status Colors:**
- **Success**: `#10b981` (Tailwind emerald-500)
- **Warning**: `#f59e0b` (Tailwind amber-500)
- **Danger**: `#ef4444` (Tailwind red-500)
- **Info**: `#3b82f6` (Tailwind blue-500)

### Typography

**Font Stack:**
- **Headings**: `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
- **Body**: `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`

**Type Scale:**
```
H1: 32px (2rem) / 700 weight / 1.2 line-height
H2: 28px (1.75rem) / 700 weight / 1.3 line-height
H3: 24px (1.5rem) / 600 weight / 1.4 line-height
H4: 20px (1.25rem) / 600 weight / 1.4 line-height
H5: 18px (1.125rem) / 600 weight / 1.5 line-height
Body Large: 18px (1.125rem) / 400 weight / 1.6 line-height
Body: 16px (1rem) / 400 weight / 1.6 line-height
Body Small: 14px (0.875rem) / 400 weight / 1.5 line-height
Label: 12px (0.75rem) / 500 weight / 1.4 line-height
```

### Spacing Scale
```
0.5x: 2px
1x: 4px
2x: 8px
3x: 12px
4x: 16px
6x: 24px
8x: 32px
12x: 48px
16x: 64px
```

### Component Spacing
- **Card padding**: 24px (6x)
- **Button padding**: 12px (3x) vertical / 16px (4x) horizontal
- **Modal padding**: 32px (8x)
- **Sidebar width**: 280px
- **Main container max-width**: 1400px

### Border Radius
```
Small: 4px (buttons, small inputs)
Medium: 8px (cards, modals)
Large: 12px (hero sections, large containers)
Full: 9999px (badges, avatars, pills)
```

### Shadows
```
Subtle: 0 1px 2px rgba(0, 0, 0, 0.05)
Small: 0 4px 6px rgba(0, 0, 0, 0.1)
Medium: 0 10px 15px rgba(0, 0, 0, 0.1)
Large: 0 20px 25px rgba(0, 0, 0, 0.15)
```

### Animations & Transitions
- **Default duration**: 150ms (fast), 200ms (standard), 250ms (slow)
- **Easing**: cubic-bezier(0.4, 0, 0.2, 1) (ease-in-out)
- **Micro-interactions**: Hover (opacity 80%), Focus (outline 2px), Active (scale 0.98)

## Layout System

### Grid & Breakpoints
```
Mobile: 320px - 640px
Tablet: 640px - 1024px
Desktop: 1024px - 1280px
Wide: 1280px+
```

### Component Library Status
- **UI Kit**: Tailwind CSS v3 + custom components (Button, Card, Input, Modal, etc.)
- **Icons**: Lucide React (24px standard)
- **Form validation**: React Hook Form (via components)
- **Data display**: Tables use semantic HTML, no grid-lock

## Visual Hierarchy & "The Trail" Metaphor

1. **Homepage**: Trail branching into Student/Instructor/Admin journeys
2. **Dashboards**: Progress milestones mapped to learning paths
3. **Course listings**: Trail-like progression (beginner → intermediate → advanced)
4. **Player**: Step-by-step lesson progression (breadcrumb as trail marker)
5. **Achievements**: Milestones and badges along the trail (gold accents)

## Accessibility

- **Contrast ratio**: WCAG AA minimum (4.5:1 for text)
- **Font size**: Minimum 14px for body text
- **Focus indicators**: Always visible (outline 2px)
- **Semantic HTML**: Proper heading hierarchy, button/link distinctions
- **Alt text**: All images require descriptive alt text
- **ARIA labels**: For custom components (modals, dropdowns, etc.)

---

**Last Updated**: Q3 2025
**Locked Elements**: Logo, Brand colors (Accent, Brand Teal, Gold), Typography font family
**Safe to Modify**: Component styling, spacing tweaks, shadow/animation refinements
