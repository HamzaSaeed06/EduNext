const PDFDocument = require('pdfkit')
const logger = require('../config/logger')

/**
 * PDF certificate generator — renders a Certificate of Completion styled
 * per DESIGN_SYSTEM.md (trail/flag motif, brand colors). Returns a Buffer
 * so callers can store it (Cloudinary/S3) or stream it directly.
 */

const COLORS = {
  bgBase: '#F6F7F3',
  inkPrimary: '#182620',
  inkMuted: '#5A6B60',
  border: '#DADFD3',
  trailGreen: '#2F6F4E',
  trailAmber: '#E2A03E',
}

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

/**
 * Draw a small hand-drawn-style trail with a flag at the end — the
 * signature element from DESIGN_SYSTEM.md Section 5, adapted for a
 * static PDF certificate.
 */
const drawTrailFlag = (doc, x, y) => {
  doc.save()
  doc
    .moveTo(x, y + 30)
    .bezierCurveTo(x + 15, y + 10, x + 25, y + 35, x + 45, y)
    .lineWidth(3)
    .strokeColor(COLORS.trailGreen)
    .stroke()

  // Flag pole + pennant at the trail's end
  const poleX = x + 45
  doc
    .moveTo(poleX, y)
    .lineTo(poleX, y - 28)
    .lineWidth(2)
    .strokeColor(COLORS.inkPrimary)
    .stroke()
  doc
    .moveTo(poleX, y - 28)
    .lineTo(poleX + 16, y - 22)
    .lineTo(poleX, y - 16)
    .closePath()
    .fillColor(COLORS.trailAmber)
    .fill()
  doc.restore()
}

const generateCertificatePdf = ({ studentName, courseTitle, instructorName, issuedAt, certificateId }) =>
  new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 0 })
      const chunks = []
      doc.on('data', (chunk) => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      const { width, height } = doc.page

      // Background + border frame
      doc.rect(0, 0, width, height).fill(COLORS.bgBase)
      doc
        .rect(24, 24, width - 48, height - 48)
        .lineWidth(2)
        .strokeColor(COLORS.border)
        .stroke()
      doc
        .rect(40, 40, width - 80, height - 80)
        .lineWidth(1)
        .strokeColor(COLORS.trailAmber)
        .stroke()

      doc
        .fillColor(COLORS.inkMuted)
        .fontSize(13)
        .font('Helvetica')
        .text('EDUNEXT', 0, 80, { align: 'center', characterSpacing: 4 })

      doc
        .fillColor(COLORS.inkPrimary)
        .fontSize(38)
        .font('Helvetica-Bold')
        .text('Certificate of Completion', 0, 110, { align: 'center' })

      doc
        .fillColor(COLORS.inkMuted)
        .fontSize(14)
        .font('Helvetica')
        .text('This certifies that', 0, 175, { align: 'center' })

      doc
        .fillColor(COLORS.trailGreen)
        .fontSize(30)
        .font('Helvetica-Bold')
        .text(studentName, 0, 200, { align: 'center' })

      doc
        .fillColor(COLORS.inkMuted)
        .fontSize(14)
        .font('Helvetica')
        .text('has successfully completed the trail', 0, 245, { align: 'center' })

      doc
        .fillColor(COLORS.inkPrimary)
        .fontSize(22)
        .font('Helvetica-Bold')
        .text(courseTitle, 60, 275, { align: 'center', width: width - 120 })

      doc
        .fillColor(COLORS.inkMuted)
        .fontSize(12)
        .font('Helvetica')
        .text(`Instructor: ${instructorName}`, 0, 330, { align: 'center' })

      drawTrailFlag(doc, width / 2 - 22, height - 130)

      doc
        .fillColor(COLORS.inkMuted)
        .fontSize(10)
        .font('Courier')
        .text(`Issued ${formatDate(issuedAt)}`, 60, height - 70, { width: (width - 120) / 2, align: 'left' })
      doc
        .fillColor(COLORS.inkMuted)
        .fontSize(10)
        .font('Courier')
        .text(`Certificate ID: ${certificateId}`, 60 + (width - 120) / 2, height - 70, {
          width: (width - 120) / 2,
          align: 'right',
        })

      doc.end()
    } catch (err) {
      logger.error(`[PDF] Certificate generation failed: ${err.message}`)
      reject(err)
    }
  })

module.exports = { generateCertificatePdf }
