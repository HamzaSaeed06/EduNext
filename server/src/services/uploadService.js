const path = require('path')
const logger = require('../config/logger')

/**
 * Upload service — stub for dev, swap body for Cloudinary/S3 in production.
 * All callers receive a consistent { url, publicId } shape regardless of env.
 */

const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime']
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const ALLOWED_PDF_TYPES = ['application/pdf']

const MAX_VIDEO_BYTES = 500 * 1024 * 1024  // 500 MB
const MAX_IMAGE_BYTES = 5 * 1024 * 1024    // 5 MB
const MAX_PDF_BYTES = 50 * 1024 * 1024     // 50 MB

const validateUpload = (file, type) => {
  const allowed = type === 'video' ? ALLOWED_VIDEO_TYPES
    : type === 'pdf' ? ALLOWED_PDF_TYPES
    : ALLOWED_IMAGE_TYPES
  const maxBytes = type === 'video' ? MAX_VIDEO_BYTES
    : type === 'pdf' ? MAX_PDF_BYTES
    : MAX_IMAGE_BYTES

  if (!allowed.includes(file.mimetype)) {
    throw new Error(`Invalid file type. Allowed: ${allowed.join(', ')}`)
  }
  if (file.size > maxBytes) {
    const mb = Math.round(maxBytes / 1024 / 1024)
    throw new Error(`That file is over ${mb}MB. Try a smaller version or compress it first.`)
  }
}

const uploadFile = async (file, folder = 'misc') => {
  validateUpload(file, folder)

  if (process.env.CLOUDINARY_API_KEY) {
    // Production: upload to Cloudinary
    const cloudinary = require('cloudinary').v2
    const result = await cloudinary.uploader.upload(file.path, {
      folder: `edunext/${folder}`,
      resource_type: 'auto',
    })
    return { url: result.secure_url, publicId: result.public_id }
  }

  // Development: return a placeholder URL
  const ext = path.extname(file.originalname)
  const publicId = `edunext/${folder}/${Date.now()}${ext}`
  logger.info(`[DEV UPLOAD] Stubbed upload for ${file.originalname} → ${publicId}`)
  return { url: `https://placeholder.edunext.dev/${publicId}`, publicId }
}

module.exports = { uploadFile, validateUpload }
