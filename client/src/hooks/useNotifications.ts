import { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '../features/store'

export interface AppNotification {
  id: string
  type: string
  message: string
  timestamp: string
  read: boolean
}

/**
 * Connects to the Socket.io server when the user is logged in and listens
 * for real-time notifications. Returns the notification list and controls.
 */
export function useNotifications() {
  const { accessToken } = useSelector((s: RootState) => s.auth)
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const socketRef = useRef<ReturnType<typeof import('socket.io-client')['io']> | null>(null)

  useEffect(() => {
    if (!accessToken) {
      socketRef.current?.disconnect()
      socketRef.current = null
      return
    }

    let socket: ReturnType<typeof import('socket.io-client')['io']>

    import('socket.io-client').then(({ io }) => {
      const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin.replace(/:\d+$/, ':3000')
      socket = io(SOCKET_URL, {
        auth: { token: accessToken },
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
      })

      socketRef.current = socket

      socket.on('notification', (data: Omit<AppNotification, 'id' | 'read'>) => {
        setNotifications((prev) => [
          {
            id: `${Date.now()}-${Math.random()}`,
            ...data,
            read: false,
          },
          ...prev.slice(0, 49),
        ])
      })

      socket.on('connect_error', () => {
        // Silently swallow connection errors — notifications are non-critical
      })
    }).catch(() => {})

    return () => {
      socketRef.current?.disconnect()
      socketRef.current = null
    }
  }, [accessToken])

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  const clearAll = () => setNotifications([])

  const unreadCount = notifications.filter((n) => !n.read).length

  return { notifications, unreadCount, markAllRead, clearAll }
}
