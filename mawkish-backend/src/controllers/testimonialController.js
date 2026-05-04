const { validationResult } = require('express-validator')
const Testimonial = require('../models/Testimonial')

/* GET /api/testimonials — Public */
const getTestimonials = async (req, res, next) => {
  try {
    const filter = { published: true }
    if (req.query.featured === 'true') filter.featured = true

    const testimonials = await Testimonial
      .find(filter)
      .sort({ order: 1, createdAt: -1 })
      .lean()

    res.json({ success: true, data: testimonials })
  } catch (err) {
    next(err)
  }
}

/* POST /api/testimonials — Admin */
const createTestimonial = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }
    const t = await Testimonial.create(req.body)
    res.status(201).json({ success: true, data: t })
  } catch (err) {
    next(err)
  }
}

/* PUT /api/testimonials/:id — Admin */
const updateTestimonial = async (req, res, next) => {
  try {
    const t = await Testimonial.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    )
    if (!t) return res.status(404).json({ success: false, message: 'Testimonial not found' })
    res.json({ success: true, data: t })
  } catch (err) {
    next(err)
  }
}

/* DELETE /api/testimonials/:id — Admin */
const deleteTestimonial = async (req, res, next) => {
  try {
    const t = await Testimonial.findByIdAndDelete(req.params.id)
    if (!t) return res.status(404).json({ success: false, message: 'Testimonial not found' })
    res.json({ success: true, message: 'Testimonial deleted' })
  } catch (err) {
    next(err)
  }
}

module.exports = { getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial }
