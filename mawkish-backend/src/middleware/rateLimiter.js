const rateLimit = require('express-rate-limit')

/* General API rate limit */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests — please try again later.' },
})

/* Tighter limit for the lead submission endpoint */
const leadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 1000,  // change from 5 to 100
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many submissions from this IP — please try again later.' },
})

/* Auth endpoints */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts — please try again later.' },
})

module.exports = { apiLimiter, leadLimiter, authLimiter }
