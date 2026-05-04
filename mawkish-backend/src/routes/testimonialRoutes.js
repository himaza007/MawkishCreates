const express  = require('express')
const { body } = require('express-validator')
const router   = express.Router()

const {
  getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial,
} = require('../controllers/testimonialController')
const { protect } = require('../middleware/auth')

const testimonialValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('role').trim().notEmpty().withMessage('Role is required'),
  body('text').trim().notEmpty().withMessage('Testimonial text is required'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be 1–5'),
]

/* Public */
router.get('/', getTestimonials)

/* Admin */
router.post('/',       protect, testimonialValidation, createTestimonial)
router.put('/:id',     protect, updateTestimonial)
router.delete('/:id',  protect, deleteTestimonial)

module.exports = router
