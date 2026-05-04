const express  = require('express')
const { body } = require('express-validator')
const router   = express.Router()

const {
  getCaseStudies, getCaseStudy, createCaseStudy, updateCaseStudy, deleteCaseStudy,
} = require('../controllers/caseStudyController')
const { protect } = require('../middleware/auth')

const studyValidation = [
  body('industry').trim().notEmpty().withMessage('Industry is required'),
  body('service').trim().notEmpty().withMessage('Service is required'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('background').trim().notEmpty().withMessage('Background is required'),
  body('problem').trim().notEmpty().withMessage('Problem is required'),
  body('strategy').trim().notEmpty().withMessage('Strategy is required'),
  body('execution').trim().notEmpty().withMessage('Execution is required'),
]

/* Public */
router.get('/',    getCaseStudies)
router.get('/:id', getCaseStudy)

/* Admin */
router.post('/',       protect, studyValidation, createCaseStudy)
router.put('/:id',     protect, updateCaseStudy)
router.delete('/:id',  protect, deleteCaseStudy)

module.exports = router
