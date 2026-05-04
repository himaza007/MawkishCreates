const nodemailer = require('nodemailer')
const logger     = require('./logger')

const createTransporter = () =>
  nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

/**
 * Notify the agency when a new lead is submitted.
 */
const sendLeadNotification = async (lead) => {
  if (!process.env.SMTP_USER) {
    logger.warn('Email not configured — skipping lead notification')
    return
  }

  try {
    const transporter = createTransporter()

    await transporter.sendMail({
      from:    `"Mawkish Creates" <${process.env.SMTP_USER}>`,
      to:      process.env.NOTIFY_EMAIL,
      subject: `New Lead: ${lead.name} — ${lead.company}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:auto;">
          <h2 style="color:#5c18b8;">New Lead Inquiry</h2>
          <table style="width:100%;border-collapse:collapse;">
            ${[
              ['Name',        lead.name],
              ['Company',     lead.company],
              ['Email',       lead.email],
              ['Phone',       lead.phone || '—'],
              ['Industry',    lead.industry],
              ['Service',     lead.service],
              ['Budget',      lead.budget || '—'],
              ['Description', lead.description || '—'],
            ].map(([k, v]) => `
              <tr>
                <td style="padding:8px 12px;background:#f4f4f5;font-weight:600;width:140px;">${k}</td>
                <td style="padding:8px 12px;border-bottom:1px solid #e4e4e7;">${v}</td>
              </tr>`).join('')}
          </table>
          <p style="color:#71717a;font-size:12px;margin-top:16px;">
            Submitted at ${new Date().toLocaleString()}
          </p>
        </div>
      `,
    })

    logger.info(`Lead notification sent for ${lead.email}`)
  } catch (err) {
    logger.error(`Failed to send lead notification: ${err.message}`)
    // Don't throw — email failure should not block the API response
  }
}

/**
 * Send a confirmation email to the person who submitted the form.
 */
const sendLeadConfirmation = async (lead) => {
  if (!process.env.SMTP_USER) return

  try {
    const transporter = createTransporter()

    await transporter.sendMail({
      from:    `"Mawkish Creates" <${process.env.SMTP_USER}>`,
      to:      lead.email,
      subject: "We've received your inquiry — Mawkish Creates",
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:auto;color:#27272a;">
          <div style="background:linear-gradient(135deg,#1a0533,#420f8a);padding:32px;border-radius:12px 12px 0 0;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:28px;">Mawkish Creates</h1>
            <p style="color:rgba(255,255,255,0.7);margin:8px 0 0;">Social Media Marketing Agency</p>
          </div>
          <div style="background:#fafaf9;padding:32px;border:1px solid #e4e4e7;border-top:none;border-radius:0 0 12px 12px;">
            <h2 style="color:#2d0a5e;">Hi ${lead.name},</h2>
            <p>Thank you for reaching out to <strong>Mawkish Creates</strong>. We've received your inquiry and one of our marketing strategists will be in touch within <strong>24 hours</strong> to schedule a free discovery call.</p>
            <p><strong>What you submitted:</strong></p>
            <ul style="color:#52525b;line-height:2;">
              <li>Service: ${lead.service}</li>
              <li>Industry: ${lead.industry}</li>
              ${lead.budget ? `<li>Budget: ${lead.budget}</li>` : ''}
            </ul>
            <p style="margin-top:24px;">In the meantime, feel free to explore our portfolio and success stories on our website.</p>
            <p style="color:#71717a;font-size:13px;margin-top:32px;border-top:1px solid #e4e4e7;padding-top:16px;">
              © ${new Date().getFullYear()} Mawkish Creates. From Sri Lanka to the world.
            </p>
          </div>
        </div>
      `,
    })

    logger.info(`Confirmation email sent to ${lead.email}`)
  } catch (err) {
    logger.error(`Failed to send confirmation email: ${err.message}`)
  }
}

module.exports = { sendLeadNotification, sendLeadConfirmation }
