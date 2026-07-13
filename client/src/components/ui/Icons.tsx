// Shared line-icon set used across the app instead of emoji glyphs, so every
// icon renders consistently across OS/browser and can be themed with
// currentColor. Keep new icons here rather than inlining emoji.
import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

const base = (props: IconProps) => ({
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  ...props,
})

export function GlobeIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.7-3.8-9s1.3-6.4 3.8-9z" />
    </svg>
  )
}

export function ChartBarIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </svg>
  )
}

export function PaletteIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 21a9 9 0 100-18 9 9 0 00-6.7 15c.5.5 1.2.5 1.8.1.6-.4 1.4-.4 2 0 .5.4.8 1 .8 1.6 0 .7.5 1.3 1.2 1.3H12z" />
      <circle cx="8.2" cy="10.5" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="7.5" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="15.8" cy="10.5" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function RobotIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="4" y="9" width="16" height="11" rx="2" />
      <path d="M12 5v4M9 5h6" />
      <circle cx="9" cy="14" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="14" r="1" fill="currentColor" stroke="none" />
      <path d="M9 17.5h6" />
    </svg>
  )
}

export function BriefcaseIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="7" width="18" height="12" rx="2" />
      <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M3 12h18" />
    </svg>
  )
}

export function MegaphoneIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 11v2a2 2 0 002 2h1l3 5V6l-3 3H5a2 2 0 00-2 2zM9 6l9-4v20l-9-4M18 9a3 3 0 010 6" />
    </svg>
  )
}

export function CodeIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M9 8l-5 4 5 4M15 8l5 4-5 4" />
    </svg>
  )
}

export function LockIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 118 0v4" />
    </svg>
  )
}

export function WarningIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3l10 18H2L12 3z" />
      <path d="M12 9.5v4.5" />
      <circle cx="12" cy="17" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function CheckCircleIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.5l2.3 2.3L15.5 9.5" />
    </svg>
  )
}

export function XCircleIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5l5 5M14.5 9.5l-5 5" />
    </svg>
  )
}

export function BellIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 9a6 6 0 1112 0c0 3 1 4.5 1.6 5.4a1 1 0 01-.8 1.6H5.2a1 1 0 01-.8-1.6C5 13.5 6 12 6 9z" />
      <path d="M9.5 18a2.5 2.5 0 005 0" />
    </svg>
  )
}

export function MedalIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="15" r="6" />
      <path d="M9 4l1.5 5M15 4l-1.5 5" />
      <path d="M12 12.5l1.1 2.3 2.4.3-1.8 1.7.5 2.4L12 18l-2.2 1.2.5-2.4-1.8-1.7 2.4-.3z" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function TrophyIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M7 4h10v5a5 5 0 01-10 0V4z" />
      <path d="M7 6H4.5A1.5 1.5 0 003 7.5 3.5 3.5 0 007 11M17 6h2.5A1.5 1.5 0 0121 7.5 3.5 3.5 0 0117 11" />
      <path d="M12 14v3M9 20h6M10 17h4v3h-4z" />
    </svg>
  )
}

export function MapIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z" />
      <path d="M9 4v14M15 6v14" />
    </svg>
  )
}

export function BookOpenIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 6.5C10.5 5 8 4.3 4 4.5v13c4 -.2 6.5.5 8 2 1.5-1.5 4-2.2 8-2v-13c-4-.2-6.5.5-8 2z" />
      <path d="M12 6.5v13" />
    </svg>
  )
}

export function PlayCircleIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M10 8.5l5.5 3.5-5.5 3.5v-7z" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function DocumentIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M7 3.5h7l3 3v14a1 1 0 01-1 1H7a1 1 0 01-1-1v-16a1 1 0 011-1z" />
      <path d="M14 3.5v3h3M9 12h6M9 15.5h6" />
    </svg>
  )
}

export function NoteIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 4h9l3 3v13a1 1 0 01-1 1H6a1 1 0 01-1-1V5a1 1 0 011-1z" />
      <path d="M15 4v3h3M9 10h6M9 13.5h6M9 17h4" />
    </svg>
  )
}

export function StarIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 2.5l2.9 6.1 6.6.7-5 4.6 1.4 6.5L12 17l-5.9 3.4 1.4-6.5-5-4.6 6.6-.7L12 2.5z" />
    </svg>
  )
}

export function UsersIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19a5.5 5.5 0 0111 0" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M15.5 19a4.5 4.5 0 015.5-4.3" />
    </svg>
  )
}

export function GraduationCapIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M2 8l10-4 10 4-10 4-10-4z" />
      <path d="M6 10.5V15c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5M22 8v6" />
    </svg>
  )
}

export function PartyIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 20l3-11 8 8-11 3z" />
      <path d="M8 4l1 2M13 3l.5 2.2M18 7l1.8.8M16 3.5l1 1.8" />
    </svg>
  )
}

export function SadFaceIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 10h.1M15.4 10h.1" strokeWidth={2.2} />
      <path d="M8.5 16c1-1.3 2.3-2 3.5-2s2.5.7 3.5 2" />
    </svg>
  )
}

export function LightbulbIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M9 18h6M10 21h4" />
      <path d="M12 3a6 6 0 00-3.2 11.1c.5.3.7.7.7 1.2V16h5v-.7c0-.5.2-.9.7-1.2A6 6 0 0012 3z" />
    </svg>
  )
}

export function TrendingUpIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 17l6-6 4 4 8-8M15 7h6v6" />
    </svg>
  )
}

export function VideoCameraIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="6" width="12" height="12" rx="2" />
      <path d="M15 10l6-3v10l-6-3" />
    </svg>
  )
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 12.5l4.5 4.5L19 7" />
    </svg>
  )
}

export function XIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

export function TicketFreeIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 9a2 2 0 012-2h12a2 2 0 012 2v1.2a1.6 1.6 0 000 3.2V15a2 2 0 01-2 2H6a2 2 0 01-2-2v-1.6a1.6 1.6 0 000-3.2V9z" />
      <path d="M14 7v10" strokeDasharray="2.5 2.5" />
    </svg>
  )
}

export function ClockIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  )
}
