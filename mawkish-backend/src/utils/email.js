const nodemailer = require('nodemailer')
const logger = require('./logger')

const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

const escapeHtml = (value) => {
  if (value === undefined || value === null || value === '') return '—'

  return String(Array.isArray(value) ? value.join(', ') : value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

const baseEmailStyle = `
  font-family: Cambria, Georgia, serif;
  font-size: 11pt;
  line-height: 1.15;
  color: #222;
`

const FIELD_LABELS = {
  name: 'Name',
  company: 'Company',
  email: 'Email',
  phone: 'Phone',
  industry: 'Industry',
  service: 'Service',
  track: 'Event Service Type',
  budget: 'Budget',
  description: 'Description',
  socialHandles: 'Social Media Handles',
  packagePreference: 'Package Preference',
  websiteType: 'Website Type',
  timeline: 'Timeline',
  objective: 'Objective',
  geography: 'Location / Geography',
  timing: 'Timing',
  event: 'Event',
  submittedAt: 'Submitted At',
}

const getLeadFields = (lead) => {
  if (lead.service === 'Events') {
    return [
      'name',
      'company',
      'email',
      'phone',
      'industry',
      'service',
      'track',
      'objective',
      'geography',
      'timing',
      'budget',
      'event',
      'description',
    ]
  }

  if (lead.service === 'Social Media Management') {
    return [
      'name',
      'company',
      'email',
      'phone',
      'industry',
      'service',
      'socialHandles',
      'budget',
      'description',
    ]
  }

  if (lead.service === 'Web Development') {
    return [
      'name',
      'email',
      'phone',
      'company',
      'service',
      'packagePreference',
      'industry',
      'websiteType',
      'timeline',
      'description',
    ]
  }

  return [
    'name',
    'company',
    'email',
    'phone',
    'industry',
    'service',
    'budget',
    'description',
  ]
}

const buildCompanyLeadRows = (lead) => {
  return getLeadFields(lead)
    .map((field) => {
      const label = FIELD_LABELS[field] || field

      return `
        <tr>
          <td style="${baseEmailStyle} padding: 8px 14px; background: #f1f1f1; font-weight: bold; width: 190px; vertical-align: top;">
            ${escapeHtml(label)}
          </td>
          <td style="${baseEmailStyle} padding: 8px 14px; border-bottom: 1px solid #ddd; vertical-align: top;">
            ${escapeHtml(lead[field])}
          </td>
        </tr>
      `
    })
    .join('')
}

/**
 * Notify the company when a new enquiry is submitted.
 */
const sendLeadNotification = async (lead) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.NOTIFY_EMAIL) {
    logger.warn('Email not configured — skipping lead notification')
    return
  }

  try {
    const transporter = createTransporter()

    await transporter.sendMail({
      from: `"Mawkish Creates" <${process.env.SMTP_USER}>`,
      to: process.env.NOTIFY_EMAIL,
      subject: `New ${lead.service} Enquiry: ${lead.name}${lead.company ? ` — ${lead.company}` : ''}`,
      html: `
        <div style="${baseEmailStyle} max-width: 760px; margin: 0 auto;">
          <h2 style="${baseEmailStyle} font-size: 18pt; color: #5b21b6; margin-bottom: 18px;">
            New Lead Inquiry
          </h2>

          <table style="width: 100%; border-collapse: collapse; ${baseEmailStyle}">
            ${buildCompanyLeadRows(lead)}
          </table>

          <p style="${baseEmailStyle} margin-top: 18px; color: #666;">
            Submitted at ${escapeHtml(lead.submittedAt || new Date().toLocaleString('en-LK', {
              timeZone: 'Asia/Colombo',
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: true,
            }))}
          </p>
        </div>
      `,
    })

    logger.info(`Lead notification sent for ${lead.email}`)
  } catch (err) {
    logger.error(`Failed to send lead notification: ${err.message}`)
  }
}

/**
 * Send a confirmation email to the person who submitted the form.
 */
const sendLeadConfirmation = async (lead) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS || !lead.email) {
    logger.warn('Email not configured — skipping confirmation email')
    return
  }

  try {
    const transporter = createTransporter()

    await transporter.sendMail({
      from: `"Mawkish Creates" <${process.env.SMTP_USER}>`,
      to: lead.email,
      subject: "We've received your enquiry — Mawkish Creates",
      html: `
        <div style="${baseEmailStyle} max-width: 680px; margin: 0 auto;">
          <h1 style="${baseEmailStyle} font-size: 20pt; color: #5b21b6; margin-bottom: 12px;">
            Mawkish Creates
          </h1>

          <h2 style="${baseEmailStyle} font-size: 14pt; margin-bottom: 12px;">
            Hi ${escapeHtml(lead.name)},
          </h2>

          <p style="${baseEmailStyle}">
            Thank you for contacting us.
          </p>

          <p style="${baseEmailStyle}">
            We have received your enquiry and our team will review your details shortly.
            One of our team members will get back to you soon.
          </p>

          <p style="${baseEmailStyle} font-weight: bold; margin-top: 18px;">
            Your enquiry summary:
          </p>

          <table style="width: 100%; border-collapse: collapse; ${baseEmailStyle}">
            <tr>
              <td style="${baseEmailStyle} padding: 6px 12px; background: #f1f1f1; font-weight: bold; width: 170px;">Service</td>
              <td style="${baseEmailStyle} padding: 6px 12px; border-bottom: 1px solid #ddd;">${escapeHtml(lead.service)}</td>
            </tr>

            ${
              lead.service === 'Events' && lead.track
                ? `
                  <tr>
                    <td style="${baseEmailStyle} padding: 6px 12px; background: #f1f1f1; font-weight: bold;">Event Service Type</td>
                    <td style="${baseEmailStyle} padding: 6px 12px; border-bottom: 1px solid #ddd;">${escapeHtml(lead.track)}</td>
                  </tr>
                `
                : ''
            }

            ${
              lead.company
                ? `
                  <tr>
                    <td style="${baseEmailStyle} padding: 6px 12px; background: #f1f1f1; font-weight: bold;">Company</td>
                    <td style="${baseEmailStyle} padding: 6px 12px; border-bottom: 1px solid #ddd;">${escapeHtml(lead.company)}</td>
                  </tr>
                `
                : ''
            }

            ${
              lead.industry
                ? `
                  <tr>
                    <td style="${baseEmailStyle} padding: 6px 12px; background: #f1f1f1; font-weight: bold;">Industry</td>
                    <td style="${baseEmailStyle} padding: 6px 12px; border-bottom: 1px solid #ddd;">${escapeHtml(lead.industry)}</td>
                  </tr>
                `
                : ''
            }

            ${
              lead.budget
                ? `
                  <tr>
                    <td style="${baseEmailStyle} padding: 6px 12px; background: #f1f1f1; font-weight: bold;">Budget</td>
                    <td style="${baseEmailStyle} padding: 6px 12px; border-bottom: 1px solid #ddd;">${escapeHtml(lead.budget)}</td>
                  </tr>
                `
                : ''
            }
          </table>

          <p style="${baseEmailStyle} margin-top: 20px;">
            Thank you,<br />
            Mawkish Creates
          </p>

          <p style="${baseEmailStyle} margin-top: 22px; color: #666;">
            © ${new Date().getFullYear()} Mawkish Creates. From Sri Lanka to the world.
          </p>
        </div>
      `,
    })

    logger.info(`Confirmation email sent to ${lead.email}`)
  } catch (err) {
    logger.error(`Failed to send confirmation email: ${err.message}`)
  }
}

module.exports = {
  sendLeadNotification,
  sendLeadConfirmation,
}