import { useState, useRef, useEffect, type ComponentType, type SVGProps } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotifications, type AppNotification } from '../../hooks/useNotifications'
import { CheckCircleIcon, XCircleIcon, BellIcon } from './Icons'

type NotificationIconComponent = ComponentType<SVGProps<SVGSVGElement>>

const ICON_MAP: Record<string, NotificationIconComponent> = {
  course_approved: CheckCircleIcon,
  course_rejected: XCircleIcon,
  default: BellIcon,
}

function NotificationItem({ n }: { n: AppNotification }) {
  const timeAgo = () => {
    const d = new Date(n.timestamp)
    const diff = Math.floor((Date.now() - d.getTime()) / 1000)
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    return `${Math.floor(diff / 3600)}h ago`
  }

  const IconComponent = ICON_MAP[n.type] ?? ICON_MAP.default

  return (
    <div className={`px-4 py-3 border-b border-border-color last:border-0 ${!n.read ? 'bg-signal-blue/5' : ''}`}>
      <div className="flex items-start gap-2">
        <IconComponent className={`w-4 h-4 shrink-0 mt-0.5 ${n.type === 'course_approved' ? 'text-trail-green' : n.type === 'course_rejected' ? 'text-error-clay' : 'text-ink-muted'}`} />
        <div className="flex-1 min-w-0">
          <p className="text-small text-ink-primary">{n.message}</p>
          <p className="text-micro text-ink-muted mt-0.5">{timeAgo()}</p>
        </div>
        {!n.read && <span className="w-2 h-2 rounded-full bg-signal-blue shrink-0 mt-1.5" aria-hidden="true" />}
      </div>
    </div>
  )
}

interface Props {
  collapsed?: boolean
}

export default function NotificationBell({ collapsed = false }: Props) {
  const { notifications, unreadCount, markAllRead, clearAll } = useNotifications()
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleOpen = () => {
    setOpen((o) => !o)
    if (!open) markAllRead()
  }

  return (
    <div ref={panelRef} className="relative">
      <button
        onClick={handleOpen}
        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-btn text-small text-ink-muted hover:bg-bg-surface-alt transition-colors focus:outline-none focus:ring-2 focus:ring-trail-green relative"
        title={collapsed ? 'Notifications' : undefined}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={open}
      >
        <span className="relative shrink-0">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-error-clay text-white text-micro flex items-center justify-center leading-none">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </span>
        {!collapsed && <span>Notifications</span>}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className="absolute left-full top-0 ml-2 w-80 bg-bg-surface border border-border-color rounded-card shadow-card-hover z-50 overflow-hidden"
            role="dialog"
            aria-label="Notifications"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border-color">
              <h3 className="text-small font-medium text-ink-primary">Notifications</h3>
              {notifications.length > 0 && (
                <button onClick={clearAll} className="text-micro text-ink-muted hover:text-error-clay transition-colors">
                  Clear all
                </button>
              )}
            </div>
            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-small text-ink-muted text-center py-8">No notifications yet</p>
              ) : (
                notifications.map((n) => <NotificationItem key={n.id} n={n} />)
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
