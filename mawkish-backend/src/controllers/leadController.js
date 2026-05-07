const { validationResult } = require('express-validator')

const logger = require('../utils/logger')
const { appendLeadToSheet } = require('../utils/googleSheets')
const { sendLeadNotification, sendLeadConfirmation } = require('../utils/email')

// Handles new enquiry form submissions
const createLead = async (req, res, next) => {
  try {
    // Checks if validation errors were found in leadRoutes.js
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      })
    }

    // Combines form data with extra tracking details
    const leadData = {
      ...req.body,
      submittedAt: new Date().toISOString(),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || '',
    }
    
    // Saves the enquiry into the correct Google Sheet tab
    await appendLeadToSheet(leadData)

    logger.info(`New enquiry saved to Google Sheet: ${leadData.name} <${leadData.email}> — ${leadData.service}`)

    // Sends email to company and confirmation email to user
    await sendLeadNotification(leadData)
    await sendLeadConfirmation(leadData)

    // Sends success response back to frontend
    res.status(201).json({
      success: true,
      message: 'Inquiry received. We will be in touch within 24 hours.',
    })
  } catch (err) {
    // Sends unexpected errors to the global error handler
    next(err)
  }
}

module.exports = {
  createLead,
}