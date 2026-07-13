const { Server } = require('socket.io')
const jwt = require('jsonwebtoken')
const logger = require('./logger')

let io = null

/**
 * Initialize Socket.io on the given http.Server.
 * Returns the io instance.
 */
const initSocket = (httpServer) => {
  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : ['http://localhost:5000', 'http://0.0.0.0:5000']

  io = new Server(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === 'development' ? '*' : allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  })

  // JWT auth middleware for socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1]
    if (!token) return next(new Error('Authentication required'))
    try {
      const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
      socket.userId = payload.id
      socket.userRole = payload.role
      next()
    } catch {
      next(new Error('Invalid token'))
    }
  })

  io.on('connection', (socket) => {
    // Each user joins their own private room (userId)
    socket.join(socket.userId)
    logger.debug(`[Socket.io] User ${socket.userId} connected (${socket.id})`)

    socket.on('disconnect', () => {
      logger.debug(`[Socket.io] User ${socket.userId} disconnected (${socket.id})`)
    })
  })

  logger.info('[Socket.io] Initialized')
  return io
}

/**
 * Get the Socket.io instance (after initSocket has been called).
 */
const getIO = () => {
  if (!io) {
    logger.warn('[Socket.io] getIO called before initialization — notifications silently skipped')
    return null
  }
  return io
}

/**
 * Emit a notification to a specific user room.
 */
const notifyUser = (userId, type, message, data = {}) => {
  const socket = getIO()
  if (!socket) return
  socket.to(String(userId)).emit('notification', { type, message, data, timestamp: new Date().toISOString() })
  logger.debug(`[Socket.io] Notified user ${userId}: ${message}`)
}

module.exports = { initSocket, getIO, notifyUser }
