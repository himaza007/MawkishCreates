const express  = require('express')
const { body } = require('express-validator')
const router   = express.Router()

const {
  getProjects, getIndustries, getProject,
  createProject, updateProject, deleteProject,
} = require('../controllers/portfolioController')
const { protect } = require('../middleware/auth')

const projectValidation = [
  body('industry').trim().notEmpty().withMessage('Industry is required'),
  body('year').trim().notEmpty().withMessage('Year is required'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('objective').trim().notEmpty().withMessage('Objective is required'),
]

/* Public */
router.get('/industries', getIndustries)
router.get('/',           getProjects)
router.get('/:id',        getProject)

/* Admin */
router.post('/',       protect, projectValidation, createProject)
router.put('/:id',     protect, updateProject)
router.delete('/:id',  protect, deleteProject)

module.exports = router
