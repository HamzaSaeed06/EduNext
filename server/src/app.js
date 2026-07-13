// Force Google DNS for SRV record resolution (router DNS blocks mongodb+srv:// lookups)
const dns = require('dns')
if (process.env.NODE_ENV !== 'production') {
  dns.setDefaultResultOrder('ipv4first')
  try {
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1'])
  } catch (err) {
    console.warn('Unable to set custom DNS servers:', err.message)
  }
}

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

const allowedOrigins = [
  'http://localhost:5000',
  'http://0.0.0.0:5000',
  ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim()) : []),
  // Replit's dev preview is served from a generated *.replit.dev domain (not
  // localhost) — allow it automatically so the CORS allowlist doesn't need
  // manual updates every time the workspace URL changes.
  ...(process.env.REPLIT_DEV_DOMAIN
    ? [`https://${process.env.REPLIT_DEV_DOMAIN}`, `https://${process.env.REPLIT_DEV_DOMAIN}:5000`]
    : []),
]

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

// Serves locally-cached generated assets (e.g. certificate PDFs) when
// Cloudinary isn't configured — see services/uploadService.js uploadBuffer().
app.use('/uploads', express.static(require('path').join(__dirname, '../uploads')))

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

// Fail loudly in production if file-storage credentials are missing, instead
// of silently saving a fake `placeholder.edunext.dev` URL as if it were a
// real upload — see services/uploadService.js.
const checkProductionUploadConfig = () => {
  if (process.env.NODE_ENV !== 'production') return
  const missing = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'].filter(
    (key) => !process.env[key],
  )
  if (missing.length) {
    logger.error(
      `[STARTUP] Refusing to start in production without file-storage credentials. Missing: ${missing.join(', ')}. ` +
        'Video/image/PDF uploads would otherwise silently save fake placeholder URLs. Set these in your environment (see .env.example) and restart.',
    )
    process.exit(1)
  }
}

const startServer = () => {
  checkProductionUploadConfig()
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
