const path = require('path')
const fs = require('fs')
const logger = require('../config/logger')

const UPLOADS_DIR = path.join(__dirname, '../../uploads')

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

/**
 * Upload a raw in-memory buffer (e.g. a generated PDF) rather than a
 * multer file object. Used for server-generated assets like certificates.
 * Returns { url, publicId } same shape as uploadFile.
 */
const uploadBuffer = async (buffer, folder, filename, { resourceType = 'auto', contentType } = {}) => {
  if (process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    const cloudinary = require('cloudinary').v2
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    })
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: `edunext/${folder}`, public_id: filename, resource_type: resourceType },
        (err, res) => (err ? reject(err) : resolve(res)),
      )
      stream.end(buffer)
    })
    return { url: result.secure_url, publicId: result.public_id }
  }

  // Development / no Cloudinary configured: cache to local disk and serve
  // it back via the /uploads static route so downloads are still real files
  // (not regenerated on every request) — see uploadBuffer callers.
  const dir = path.join(UPLOADS_DIR, folder)
  fs.mkdirSync(dir, { recursive: true })
  const filePath = path.join(dir, filename)
  fs.writeFileSync(filePath, buffer)
  logger.info(`[DEV UPLOAD] Cached buffer upload for ${folder}/${filename} to local disk`)
  return { url: `/uploads/${folder}/${filename}`, publicId: `${folder}/${filename}` }
}

/**
 * Read back the bytes for a URL previously returned by uploadBuffer/uploadFile
 * — a local `/uploads/...` path is read straight off disk, an `http(s)://`
 * URL (Cloudinary) is fetched. Used to serve cached files directly instead
 * of redirecting the client to storage.
 */
const readStoredBuffer = async (url) => {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch stored file (${response.status}): ${url}`)
    }
    return Buffer.from(await response.arrayBuffer())
  }

  // Local dev cache path, e.g. /uploads/certificates/<id>.pdf
  const relative = url.replace(/^\/uploads\//, '')
  return fs.readFileSync(path.join(UPLOADS_DIR, relative))
}

module.exports = { uploadFile, validateUpload, uploadBuffer, readStoredBuffer }
