const express  = require('express')
const helmet   = require('helmet')
const cors     = require('cors')
const morgan   = require('morgan')
const logger   = require('./utils/logger')

const leadRoutes        = require('./routes/leadRoutes')
const portfolioRoutes   = require('./routes/portfolioRoutes')
const caseStudyRoutes   = require('./routes/caseStudyRoutes')
const testimonialRoutes = require('./routes/testimonialRoutes')
const authRoutes        = require('./routes/authRoutes')
const { apiLimiter }    = require('./middleware/rateLimiter')
const { errorHandler, notFound } = require('./middleware/errorHandler')

const app = express()

/* ── Security headers ─────────────────────────────────────── */
app.use(helmet())

/* ── CORS ─────────────────────────────────────────────────── */
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim())

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true)
    cb(new Error(`CORS blocked: ${origin}`))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

/* ── Body parsing ─────────────────────────────────────────── */
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: false, limit: '10kb' }))

/* ── HTTP request logging ─────────────────────────────────── */
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: { write: (msg) => logger.info(msg.trim()) },
  }))
}

/* ── Global rate limiter ──────────────────────────────────── */
app.use('/api', apiLimiter)

/* ── Health check ─────────────────────────────────────────── */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    env:    process.env.NODE_ENV,
    time:   new Date().toISOString(),
  })
})

/* ── API Routes ───────────────────────────────────────────── */
app.use('/api/auth',          authRoutes)
app.use('/api/leads',         leadRoutes)
app.use('/api/portfolio',     portfolioRoutes)
app.use('/api/case-studies',  caseStudyRoutes)
app.use('/api/testimonials',  testimonialRoutes)

/* ── 404 + Error handler ──────────────────────────────────── */
app.use(notFound)
app.use(errorHandler)

module.exports = app
