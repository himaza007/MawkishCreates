const { validationResult } = require('express-validator')
const CaseStudy = require('../models/CaseStudy')

/* GET /api/case-studies — Public */
const getCaseStudies = async (req, res, next) => {
  try {
    const { industry, featured } = req.query
    const filter = { published: true }

    if (industry) filter.industry = industry
    if (featured === 'true') filter.featured = true

    const studies = await CaseStudy
      .find(filter)
      .sort({ order: 1, createdAt: -1 })
      .lean()

    res.json({ success: true, data: studies })
  } catch (err) {
    next(err)
  }
}

/* GET /api/case-studies/:id — Public */
const getCaseStudy = async (req, res, next) => {
  try {
    const study = await CaseStudy.findOne({ _id: req.params.id, published: true })
    if (!study) return res.status(404).json({ success: false, message: 'Case study not found' })
    res.json({ success: true, data: study })
  } catch (err) {
    next(err)
  }
}

/* POST /api/case-studies — Admin */
const createCaseStudy = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }
    const study = await CaseStudy.create(req.body)
    res.status(201).json({ success: true, data: study })
  } catch (err) {
    next(err)
  }
}

/* PUT /api/case-studies/:id — Admin */
const updateCaseStudy = async (req, res, next) => {
  try {
    const study = await CaseStudy.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    )
    if (!study) return res.status(404).json({ success: false, message: 'Case study not found' })
    res.json({ success: true, data: study })
  } catch (err) {
    next(err)
  }
}

/* DELETE /api/case-studies/:id — Admin */
const deleteCaseStudy = async (req, res, next) => {
  try {
    const study = await CaseStudy.findByIdAndDelete(req.params.id)
    if (!study) return res.status(404).json({ success: false, message: 'Case study not found' })
    res.json({ success: true, message: 'Case study deleted' })
  } catch (err) {
    next(err)
  }
}

module.exports = { getCaseStudies, getCaseStudy, createCaseStudy, updateCaseStudy, deleteCaseStudy }
