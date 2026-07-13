const logger = require('../config/logger')

/**
 * Email service — uses nodemailer in production, logs to console in development.
 * Swap the transport below when SMTP credentials are provided via env vars.
 */

const sendEmail = async ({ to, subject, html }) => {
  if (process.env.NODE_ENV !== 'production' || !process.env.EMAIL_HOST) {
    logger.info(`[DEV EMAIL] To: ${to} | Subject: ${subject}`)
    logger.debug(`[DEV EMAIL BODY]: ${html}`)
    return { messageId: 'dev-console' }
  }

  const nodemailer = require('nodemailer')
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  })

  const info = await transport.sendMail({
    from: process.env.EMAIL_FROM || 'EduNext <noreply@edunext.com>',
    to,
    subject,
    html,
  })
  return { messageId: info.messageId }
}

const sendVerificationEmail = (to, token) =>
  sendEmail({
    to,
    subject: 'Verify your EduNext account',
    html: `
      <p>Welcome to EduNext! Confirm your email address to get started.</p>
      <p><a href="${process.env.CLIENT_URL || 'http://localhost:5000'}/verify-email?token=${token}">Verify email</a></p>
      <p>This link expires in 24 hours.</p>
    `,
  })

const sendPasswordResetEmail = (to, token) =>
  sendEmail({
    to,
    subject: 'Reset your EduNext password',
    html: `
      <p>You requested a password reset. Click the link below — it expires in 1 hour.</p>
      <p><a href="${process.env.CLIENT_URL || 'http://localhost:5000'}/reset-password?token=${token}">Reset password</a></p>
      <p>If you didn't request this, ignore this email.</p>
    `,
  })

module.exports = { sendEmail, sendVerificationEmail, sendPasswordResetEmail }
