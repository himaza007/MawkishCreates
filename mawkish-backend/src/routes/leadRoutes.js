const express   = require('express')
const { body }  = require('express-validator')
const router    = express.Router()

const {
  createLead, getLeads, getLead, updateLead, deleteLead, getLeadStats,
} = require('../controllers/leadController')
const { protect }     = require('../middleware/auth')
const { leadLimiter } = require('../middleware/rateLimiter')

/* ── Validation rules ─────────────────────────────────────── */
const leadValidation = [
  body('name')
    .trim().notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name must be under 100 characters'),
  body('company')
    .trim().notEmpty().withMessage('Company name is required')
    .isLength({ max: 150 }).withMessage('Company name must be under 150 characters'),
  body('email')
    .trim().isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
  body('phone')
    .optional({ checkFalsy: true })
    .trim().isLength({ max: 30 }).withMessage('Phone must be under 30 characters'),
  body('industry')
    .trim().notEmpty().withMessage('Industry is required'),
  body('service')
    .trim().notEmpty().withMessage('Service selection is required')
    .isIn([
      'Lead Generation',
      'Social Media Management',
      'Marketing Coaching',
      'Done-For-You Marketing',
      'Not Sure Yet',
    ]).withMessage('Invalid service selection'),
  body('budget')
    .optional({ checkFalsy: true }).trim(),
  body('description')
    .optional({ checkFalsy: true })
    .trim().isLength({ max: 2000 }).withMessage('Description must be under 2000 characters'),
]

/* ── Public ───────────────────────────────────────────────── */
// POST /api/leads
router.post('/', leadLimiter, leadValidation, createLead)

/* ── Protected (Admin) ────────────────────────────────────── */
// GET /api/leads/stats  — must be before /:id
router.get('/stats',  protect, getLeadStats)
router.get('/',       protect, getLeads)
router.get('/:id',    protect, getLead)
router.patch('/:id',  protect, updateLead)
router.delete('/:id', protect, deleteLead)

module.exports = router
