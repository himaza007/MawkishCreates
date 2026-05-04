const { validationResult } = require('express-validator')
const Lead   = require('../models/Lead')
const logger = require('../utils/logger')
const { sendLeadNotification, sendLeadConfirmation } = require('../utils/email')

/* ─────────────────────────────────────────────────────────────
   POST /api/leads
   Public — submit inquiry form
───────────────────────────────────────────────────────────── */
const createLead = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    const { name, company, email, phone, industry, service, budget, description } = req.body

    const lead = await Lead.create({
      name, company, email, phone,
      industry, service, budget, description,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || '',
    })

    logger.info(`New lead: ${lead.name} <${lead.email}> — ${lead.service}`)

    // Fire-and-forget emails (don't await so they don't delay the response)
    sendLeadNotification(lead)
    sendLeadConfirmation(lead)

    res.status(201).json({
      success: true,
      message: 'Inquiry received. We will be in touch within 24 hours.',
      data: { id: lead._id },
    })
  } catch (err) {
    next(err)
  }
}

/* ─────────────────────────────────────────────────────────────
   GET /api/leads  (admin)
   Supports: ?status=new&page=1&limit=20&search=company
───────────────────────────────────────────────────────────── */
const getLeads = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20, sort = '-createdAt' } = req.query

    const filter = {}
    if (status) filter.status = status
    if (search) {
      filter.$or = [
        { name:    { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { email:   { $regex: search, $options: 'i' } },
      ]
    }

    const pageNum   = Math.max(1, parseInt(page))
    const limitNum  = Math.min(100, parseInt(limit))
    const skip      = (pageNum - 1) * limitNum

    const [leads, total] = await Promise.all([
      Lead.find(filter).sort(sort).skip(skip).limit(limitNum).lean(),
      Lead.countDocuments(filter),
    ])

    res.json({
      success: true,
      data: leads,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum,
      },
    })
  } catch (err) {
    next(err)
  }
}

/* ─────────────────────────────────────────────────────────────
   GET /api/leads/:id  (admin)
───────────────────────────────────────────────────────────── */
const getLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id)
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' })
    res.json({ success: true, data: lead })
  } catch (err) {
    next(err)
  }
}

/* ─────────────────────────────────────────────────────────────
   PATCH /api/leads/:id  (admin)
   Update status / notes
───────────────────────────────────────────────────────────── */
const updateLead = async (req, res, next) => {
  try {
    const allowed = ['status', 'notes']
    const updates = {}
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k] })

    const lead = await Lead.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' })

    res.json({ success: true, data: lead })
  } catch (err) {
    next(err)
  }
}

/* ─────────────────────────────────────────────────────────────
   DELETE /api/leads/:id  (admin)
───────────────────────────────────────────────────────────── */
const deleteLead = async (req, res, next) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id)
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' })
    res.json({ success: true, message: 'Lead deleted' })
  } catch (err) {
    next(err)
  }
}

/* ─────────────────────────────────────────────────────────────
   GET /api/leads/stats  (admin)
───────────────────────────────────────────────────────────── */
const getLeadStats = async (req, res, next) => {
  try {
    const [byStatus, byService, recentCount] = await Promise.all([
      Lead.aggregate([{ $group: { _id: '$status',  count: { $sum: 1 } } }]),
      Lead.aggregate([{ $group: { _id: '$service', count: { $sum: 1 } } }]),
      Lead.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }),
    ])

    res.json({
      success: true,
      data: { byStatus, byService, recentCount },
    })
  } catch (err) {
    next(err)
  }
}

module.exports = { createLead, getLeads, getLead, updateLead, deleteLead, getLeadStats }
