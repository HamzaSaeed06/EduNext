require('dotenv').config()
const http = require('http')
const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')

const connectDB = require('./config/db')
const logger = require('./config/logger')
const { initSocket } = require('./config/socket')
const { errorHandler } = require('./middlewares/errorHandler')
const { generalLimiter } = require('./middlewares/rateLimiter')
const indexRouter = require('./routes/index')
const authRouter = require('./routes/auth')
const coursesRouter = require('./routes/courses')
const quizzesRouter = require('./routes/quizzes')
const aiRouter = require('./routes/ai')
const discussionsRouter = require('./routes/discussions')
const usersRouter = require('./routes/users')

const app = express()
const httpServer = http.createServer(app)

app.set('trust proxy', 1)

app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        scriptSrc: ["'self'"],
      },
    },
  }),
)

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:5000', 'http://0.0.0.0:5000']

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
)

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())

if (process.env.NODE_ENV !== 'test') {
  app.use(
    morgan('combined', {
      stream: { write: (message) => logger.info(message.trim()) },
    }),
  )
}

app.use('/api/v1', generalLimiter)

app.use('/api/v1', indexRouter)
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/courses', coursesRouter)
app.use('/api/v1', quizzesRouter)
app.use('/api/v1', aiRouter)
app.use('/api/v1', discussionsRouter)
app.use('/api/v1', usersRouter)

app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: `Route ${req.originalUrl} not found` },
  })
})

app.use(errorHandler)

const PORT = parseInt(process.env.PORT || '3000', 10)

const startServer = () => {
  if (process.env.NODE_ENV !== 'test') {
    initSocket(httpServer)
  }
  httpServer.listen(PORT, '0.0.0.0', () => {
    logger.info(`EduNext server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`)
    if (process.env.NODE_ENV !== 'test') {
      connectDB().catch((err) => {
        logger.warn(`MongoDB unavailable: ${err.message} — API running without DB`)
      })
    }
  })
}

if (require.main === module) {
  startServer()
}

module.exports = app
