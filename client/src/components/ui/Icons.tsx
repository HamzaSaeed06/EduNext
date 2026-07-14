// Shared icon set used across the app instead of emoji glyphs. These are
// thin re-exports of lucide-react (the standard, widely-used icon library —
// https://lucide.dev), not hand-drawn shapes, so every icon is a real,
// recognizable glyph and stays consistent with the rest of the ecosystem.
// Keep using this file (add new lucide re-exports here) instead of inlining
// emoji or drawing custom SVG paths.
import {
  Globe, BarChart3, Palette, Bot, Briefcase, Megaphone, Code2, Lock,
  AlertTriangle, CheckCircle2, XCircle, Bell, Medal, Trophy, Map as MapIconLucide,
  BookOpen, PlayCircle, FileText, StickyNote, Star, Users, GraduationCap,
  PartyPopper, Frown, Lightbulb, TrendingUp, Video, ArrowRight, Check, X,
  Ticket, Clock, Trash2,
  type LucideProps,
} from 'lucide-react'

type IconProps = LucideProps

const withDefaults = (Icon: typeof Globe) => (props: IconProps) => <Icon strokeWidth={1.75} {...props} />

export const GlobeIcon = withDefaults(Globe)
export const ChartBarIcon = withDefaults(BarChart3)
export const PaletteIcon = withDefaults(Palette)
export const RobotIcon = withDefaults(Bot)
export const BriefcaseIcon = withDefaults(Briefcase)
export const MegaphoneIcon = withDefaults(Megaphone)
export const CodeIcon = withDefaults(Code2)
export const LockIcon = withDefaults(Lock)
export const WarningIcon = withDefaults(AlertTriangle)
export const CheckCircleIcon = withDefaults(CheckCircle2)
export const XCircleIcon = withDefaults(XCircle)
export const BellIcon = withDefaults(Bell)
export const MedalIcon = withDefaults(Medal)
export const TrophyIcon = withDefaults(Trophy)
export const MapIcon = withDefaults(MapIconLucide)
export const BookOpenIcon = withDefaults(BookOpen)
export const PlayCircleIcon = withDefaults(PlayCircle)
export const DocumentIcon = withDefaults(FileText)
export const NoteIcon = withDefaults(StickyNote)
export const UsersIcon = withDefaults(Users)
export const GraduationCapIcon = withDefaults(GraduationCap)
export const PartyIcon = withDefaults(PartyPopper)
export const SadFaceIcon = withDefaults(Frown)
export const LightbulbIcon = withDefaults(Lightbulb)
export const TrendingUpIcon = withDefaults(TrendingUp)
export const VideoCameraIcon = withDefaults(Video)
export const ArrowRightIcon = withDefaults(ArrowRight)
export const CheckIcon = withDefaults(Check)
export const XIcon = withDefaults(X)
export const TicketFreeIcon = withDefaults(Ticket)
export const ClockIcon = withDefaults(Clock)
export const TrashIcon = withDefaults(Trash2)

// Star is used both as a filled rating glyph and (rarely) outlined —
// default to filled since every current usage wants a solid star.
export function StarIcon(props: IconProps) {
  return <Star fill="currentColor" strokeWidth={0} {...props} />
}
