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

const getSubmittedTime = (lead) => {
  return lead.submittedAt || new Date().toLocaleString('en-LK', {
    timeZone: 'Asia/Colombo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })
}

const baseEmailStyle = `
  font-family: Cambria, Georgia, serif;
  font-size: 11pt;
  line-height: 1.15;
  color: #222222;
`

const emailPageStyle = `
  margin: 0;
  padding: 24px;
  background-color: #ffffff;
  ${baseEmailStyle}
`

const cardStyle = `
  max-width: 760px;
  margin: 0 auto;
  background-color: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 14px;
  overflow: hidden;
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
          <td style="${baseEmailStyle} padding: 9px 14px; background-color: #f4f1fb; color: #2d0a5e; font-weight: bold; width: 190px; vertical-align: top; border-bottom: 1px solid #e5e5e5;">
            ${escapeHtml(label)}
          </td>
          <td style="${baseEmailStyle} padding: 9px 14px; background-color: #ffffff; color: #222222; vertical-align: top; border-bottom: 1px solid #e5e5e5;">
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
        <div style="${emailPageStyle}">
          <div style="${cardStyle}">
            <div style="background-color: #2d0a5e; padding: 22px 26px;">
              <h2 style="${baseEmailStyle} margin: 0; font-size: 18pt; color: #ffffff; font-weight: bold;">
                New Lead Inquiry
              </h2>
              <p style="${baseEmailStyle} margin: 6px 0 0; color: #d8c8ff;">
                A new enquiry has been submitted through the Mawkish Creates website.
              </p>
            </div>

            <div style="padding: 24px 26px; background-color: #ffffff;">
              <table style="width: 100%; border-collapse: collapse; background-color: #ffffff; ${baseEmailStyle}">
                ${buildCompanyLeadRows(lead)}
              </table>

              <p style="${baseEmailStyle} margin-top: 18px; color: #666666;">
                Submitted at ${escapeHtml(getSubmittedTime(lead))}
              </p>
            </div>
          </div>
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
        <div style="${emailPageStyle}">
          <div style="${cardStyle}">
            <div style="background-color: #2d0a5e; padding: 28px 30px; text-align: center;">
              <h1 style="${baseEmailStyle} margin: 0; font-size: 22pt; color: #ffffff; font-weight: bold;">
                Mawkish Creates
              </h1>
              <p style="${baseEmailStyle} margin: 8px 0 0; color: #d8c8ff;">
                Creative digital solutions for growing brands
              </p>
            </div>

            <div style="padding: 30px; background-color: #ffffff;">
              <h2 style="${baseEmailStyle} margin: 0 0 14px; font-size: 15pt; color: #2d0a5e; font-weight: bold;">
                Hi ${escapeHtml(lead.name)},
              </h2>

              <p style="${baseEmailStyle} margin: 0 0 12px;">
                Thank you for contacting us.
              </p>

              <p style="${baseEmailStyle} margin: 0 0 18px;">
                We have received your enquiry and our team will review your details shortly.
                One of our team members will get back to you soon.
              </p>

              <div style="background-color: #f8f5ff; border-left: 4px solid #5b21b6; padding: 14px 18px; margin: 20px 0;">
                <p style="${baseEmailStyle} margin: 0; color: #2d0a5e; font-weight: bold;">
                  Your enquiry summary
                </p>
              </div>

              <table style="width: 100%; border-collapse: collapse; background-color: #ffffff; ${baseEmailStyle}">
                <tr>
                  <td style="${baseEmailStyle} padding: 8px 12px; background-color: #f4f1fb; color: #2d0a5e; font-weight: bold; width: 170px; border-bottom: 1px solid #e5e5e5;">
                    Service
                  </td>
                  <td style="${baseEmailStyle} padding: 8px 12px; color: #222222; border-bottom: 1px solid #e5e5e5;">
                    ${escapeHtml(lead.service)}
                  </td>
                </tr>

                ${
                  lead.service === 'Events' && lead.track
                    ? `
                      <tr>
                        <td style="${baseEmailStyle} padding: 8px 12px; background-color: #f4f1fb; color: #2d0a5e; font-weight: bold; border-bottom: 1px solid #e5e5e5;">
                          Event Service Type
                        </td>
                        <td style="${baseEmailStyle} padding: 8px 12px; color: #222222; border-bottom: 1px solid #e5e5e5;">
                          ${escapeHtml(lead.track)}
                        </td>
                      </tr>
                    `
                    : ''
                }

                ${
                  lead.company
                    ? `
                      <tr>
                        <td style="${baseEmailStyle} padding: 8px 12px; background-color: #f4f1fb; color: #2d0a5e; font-weight: bold; border-bottom: 1px solid #e5e5e5;">
                          Company
                        </td>
                        <td style="${baseEmailStyle} padding: 8px 12px; color: #222222; border-bottom: 1px solid #e5e5e5;">
                          ${escapeHtml(lead.company)}
                        </td>
                      </tr>
                    `
                    : ''
                }

                ${
                  lead.industry
                    ? `
                      <tr>
                        <td style="${baseEmailStyle} padding: 8px 12px; background-color: #f4f1fb; color: #2d0a5e; font-weight: bold; border-bottom: 1px solid #e5e5e5;">
                          Industry
                        </td>
                        <td style="${baseEmailStyle} padding: 8px 12px; color: #222222; border-bottom: 1px solid #e5e5e5;">
                          ${escapeHtml(lead.industry)}
                        </td>
                      </tr>
                    `
                    : ''
                }

                ${
                  lead.budget
                    ? `
                      <tr>
                        <td style="${baseEmailStyle} padding: 8px 12px; background-color: #f4f1fb; color: #2d0a5e; font-weight: bold; border-bottom: 1px solid #e5e5e5;">
                          Budget
                        </td>
                        <td style="${baseEmailStyle} padding: 8px 12px; color: #222222; border-bottom: 1px solid #e5e5e5;">
                          ${escapeHtml(lead.budget)}
                        </td>
                      </tr>
                    `
                    : ''
                }
              </table>

              <p style="${baseEmailStyle} margin: 22px 0 0;">
                Thank you,<br />
                <strong style="color: #2d0a5e;">Mawkish Creates</strong>
              </p>
            </div>

            <div style="background-color: #f4f1fb; padding: 16px 30px; text-align: center;">
              <p style="${baseEmailStyle} margin: 0; color: #666666;">
                © ${new Date().getFullYear()} Mawkish Creates. From Sri Lanka to the world.
              </p>
            </div>
          </div>
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