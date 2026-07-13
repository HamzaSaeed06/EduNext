const Certificate = require('../models/Certificate')
const Enrollment = require('../models/Enrollment')
const Course = require('../models/Course')
const User = require('../models/User')
const { AppError, asyncHandler } = require('../middlewares/errorHandler')
const { generateCertificatePdf } = require('../services/pdfService')
const { uploadBuffer, readStoredBuffer } = require('../services/uploadService')

// POST /api/v1/courses/:slug/certificate  — issue after 100% completion
const issueCertificate = asyncHandler(async (req, res) => {
  const course = await Course.findOne({ slug: req.params.slug, isDeleted: false })
    .populate('instructor', 'name')
  if (!course) throw new AppError('Course not found', 404, 'NOT_FOUND')

  const enrollment = await Enrollment.findOne({ student: req.user._id, course: course._id })
  if (!enrollment) throw new AppError('You are not enrolled in this course', 403, 'FORBIDDEN')
  if (!enrollment.isCompleted) throw new AppError('Complete the course before claiming your certificate', 400, 'NOT_COMPLETE')

  const existing = await Certificate.findOne({ student: req.user._id, course: course._id })
  if (existing) return res.json({ success: true, data: { certificate: existing }, message: 'Certificate already issued' })

  const certificate = await Certificate.create({
    student: req.user._id,
    course: course._id,
    enrollment: enrollment._id,
    studentName: req.user.name,
    courseTitle: course.title,
    instructorName: course.instructor?.name || 'EduNext',
  })

  res.status(201).json({ success: true, data: { certificate }, message: 'Certificate issued!' })
})

// GET /api/v1/certificates/verify/:certId  — public verification
const verifyCertificate = asyncHandler(async (req, res) => {
  const certificate = await Certificate.findOne({ certificateId: req.params.certId })
    .populate('student', 'name')
    .populate('course', 'title level category')

  if (!certificate) throw new AppError('Certificate not found or invalid', 404, 'NOT_FOUND')

  res.json({
    success: true,
    data: {
      certificate: {
        certificateId: certificate.certificateId,
        studentName: certificate.studentName,
        courseTitle: certificate.courseTitle,
        instructorName: certificate.instructorName,
        issuedAt: certificate.issuedAt,
        course: certificate.course,
      },
    },
    message: 'Certificate is valid',
  })
})

// GET /api/v1/student/certificates  — student's certificates
const getMyCertificates = asyncHandler(async (req, res) => {
  const certificates = await Certificate.find({ student: req.user._id })
    .sort({ issuedAt: -1 })
    .populate('course', 'title slug thumbnail level category instructor')
  res.json({ success: true, data: { certificates }, message: '' })
})

// GET /api/v1/certificates/:certId/download — serves the actual PDF file
// bytes directly (Content-Type: application/pdf), not a redirect. Generated
// once and cached (Certificate.pdfUrl + local/Cloudinary storage via
// uploadBuffer); subsequent downloads read the cached bytes back instead of
// regenerating the PDF.
const downloadCertificate = asyncHandler(async (req, res) => {
  const certificate = await Certificate.findOne({ certificateId: req.params.certId })
  if (!certificate) throw new AppError('Certificate not found or invalid', 404, 'NOT_FOUND')

  // Only the certificate's owner or an admin may download it — certificate
  // IDs are unguessable (UUID) but shouldn't be treated as a public bearer
  // token for someone else's private record.
  if (req.user.role !== 'admin' && String(certificate.student) !== String(req.user._id)) {
    throw new AppError('You do not have access to this certificate', 403, 'FORBIDDEN')
  }

  let pdfBuffer

  if (!certificate.pdfUrl) {
    pdfBuffer = await generateCertificatePdf({
      studentName: certificate.studentName,
      courseTitle: certificate.courseTitle,
      instructorName: certificate.instructorName,
      issuedAt: certificate.issuedAt,
      certificateId: certificate.certificateId,
    })

    const { url } = await uploadBuffer(pdfBuffer, 'certificates', `${certificate.certificateId}.pdf`, {
      resourceType: 'raw',
    })
    certificate.pdfUrl = url
    await certificate.save()
  } else {
    pdfBuffer = await readStoredBuffer(certificate.pdfUrl)
  }

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="EduNext-Certificate-${certificate.certificateId}.pdf"`,
    'Content-Length': pdfBuffer.length,
  })
  return res.send(pdfBuffer)
})

module.exports = { issueCertificate, verifyCertificate, getMyCertificates, downloadCertificate }
