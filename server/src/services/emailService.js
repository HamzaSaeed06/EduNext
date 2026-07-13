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

const sendWelcomeEmail = (user) => {
  const to = user.email
  const name = user.name || 'Student'
  return sendEmail({
    to,
    subject: 'Welcome to EduNext!',
    html: `
      <div style="font-family: sans-serif; color: #182620; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to EduNext, ${name}!</h2>
        <p>Your learning journey starts here. Walk your own trail, complete checkpoints, and earn verified certificates.</p>
        <p><a href="${process.env.CLIENT_URL || 'http://localhost:5000'}/courses" style="display: inline-block; background-color: #E2A03E; color: #FFFFFF; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold;">Browse Courses</a></p>
      </div>
    `,
  }).catch((err) => {
    logger.error(`Welcome email failed to send: ${err.message}`)
  })
}

const sendEnrollmentConfirmation = (user, course) => {
  const to = user.email
  const name = user.name || 'Student'
  return sendEmail({
    to,
    subject: `Enrolled: ${course.title}`,
    html: `
      <div style="font-family: sans-serif; color: #182620; max-width: 600px; margin: 0 auto;">
        <h2>Hi ${name}, you're enrolled!</h2>
        <p>You have successfully started the trail for <strong>${course.title}</strong>.</p>
        <p>Prepare to complete the course checkpoints and reach the summit.</p>
        <p><a href="${process.env.CLIENT_URL || 'http://localhost:5000'}/courses/${course.slug || course._id}" style="display: inline-block; background-color: #E2A03E; color: #FFFFFF; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold;">Start Learning</a></p>
      </div>
    `,
  }).catch((err) => {
    logger.error(`Enrollment email failed to send: ${err.message}`)
  })
}

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendEnrollmentConfirmation,
}
