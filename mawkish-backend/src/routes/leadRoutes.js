const express = require('express')
const { body } = require('express-validator')

const { createLead } = require('../controllers/leadController')
const { leadLimiter } = require('../middleware/rateLimiter')
const { ALLOWED_SERVICES } = require('../config/sheetConfig')
console.log('Allowed services:', ALLOWED_SERVICES)

const router = express.Router()

// Validation rules for enquiry form submissions
const leadValidation = [
  // Common fields used by all/most service forms
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name must be under 100 characters'),

  body('email')
    .trim()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),

  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 30 })
    .withMessage('Phone must be under 30 characters'),

  body('company')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 150 })
    .withMessage('Company name must be under 150 characters'),

  body('industry')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Industry must be under 100 characters'),

  body('service')
    .trim()
    .notEmpty()
    .withMessage('Service selection is required')
    .isIn(ALLOWED_SERVICES)
    .withMessage('Invalid service selection'),

  body('budget')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Budget must be under 100 characters'),

  body('description')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must be under 2000 characters'),

  // Social Media Management specific field
  body('socialHandles')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 200 })
    .withMessage('Social media handles must be under 200 characters'),

  // Web Development specific fields
  body('packagePreference')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Package preference must be under 100 characters'),

  body('websiteType')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Website type must be under 100 characters'),

  body('timeline')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Timeline must be under 100 characters'),

  // Events specific fields
  body('track')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 150 })
    .withMessage('Event track must be under 150 characters'),

  body('objective')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Objective must be under 2000 characters'),

  body('geography')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 150 })
    .withMessage('Location must be under 150 characters'),

  body('timing')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Timing must be under 100 characters'),

  body('event')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 150 })
    .withMessage('Event name must be under 150 characters'),
]

// POST /api/leads
// Applies rate limiting, validates form data, then sends it to the controller
router.post(
  '/',
  leadLimiter,
  (req, res, next) => {
    console.log('Received service:', req.body.service)
    next()
  },
  leadValidation,
  createLead
)

module.exports = router