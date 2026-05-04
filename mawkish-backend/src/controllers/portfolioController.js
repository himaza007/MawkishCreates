const { validationResult } = require('express-validator')
const PortfolioProject = require('../models/PortfolioProject')

/* ─────────────────────────────────────────────────────────────
   GET /api/portfolio
   Public — supports ?industry=E-Commerce&featured=true
───────────────────────────────────────────────────────────── */
const getProjects = async (req, res, next) => {
  try {
    const { industry, featured } = req.query
    const filter = { published: true }

    if (industry && industry !== 'All') filter.industry = industry
    if (featured === 'true') filter.featured = true

    const projects = await PortfolioProject
      .find(filter)
      .sort({ order: 1, createdAt: -1 })
      .lean()

    res.json({ success: true, data: projects })
  } catch (err) {
    next(err)
  }
}

/* ─────────────────────────────────────────────────────────────
   GET /api/portfolio/industries
   Public — unique list of industries for the filter bar
───────────────────────────────────────────────────────────── */
const getIndustries = async (req, res, next) => {
  try {
    const industries = await PortfolioProject.distinct('industry', { published: true })
    res.json({ success: true, data: industries.sort() })
  } catch (err) {
    next(err)
  }
}

/* ─────────────────────────────────────────────────────────────
   GET /api/portfolio/:id  — Public
───────────────────────────────────────────────────────────── */
const getProject = async (req, res, next) => {
  try {
    const project = await PortfolioProject.findOne({ _id: req.params.id, published: true })
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' })
    res.json({ success: true, data: project })
  } catch (err) {
    next(err)
  }
}

/* ─────────────────────────────────────────────────────────────
   POST /api/portfolio  (admin)
───────────────────────────────────────────────────────────── */
const createProject = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }
    const project = await PortfolioProject.create(req.body)
    res.status(201).json({ success: true, data: project })
  } catch (err) {
    next(err)
  }
}

/* ─────────────────────────────────────────────────────────────
   PUT /api/portfolio/:id  (admin)
───────────────────────────────────────────────────────────── */
const updateProject = async (req, res, next) => {
  try {
    const project = await PortfolioProject.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    )
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' })
    res.json({ success: true, data: project })
  } catch (err) {
    next(err)
  }
}

/* ─────────────────────────────────────────────────────────────
   DELETE /api/portfolio/:id  (admin)
───────────────────────────────────────────────────────────── */
const deleteProject = async (req, res, next) => {
  try {
    const project = await PortfolioProject.findByIdAndDelete(req.params.id)
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' })
    res.json({ success: true, message: 'Project deleted' })
  } catch (err) {
    next(err)
  }
}

module.exports = { getProjects, getIndustries, getProject, createProject, updateProject, deleteProject }
