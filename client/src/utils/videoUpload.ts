/**
 * Client-side pre-check for instructor video uploads (mirrors the
 * server-side re-validation in server/src/services/uploadService.js —
 * never trust this check alone, per AGENT_RULES.md Section 6).
 */
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime']
export const MAX_VIDEO_BYTES = 500 * 1024 * 1024 // 500 MB

export interface VideoValidationResult {
  valid: boolean
  error?: string
}

export function validateVideoFile(file: Pick<File, 'type' | 'size'>): VideoValidationResult {
  if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Only MP4, WebM, and QuickTime videos are allowed.' }
  }
  if (file.size > MAX_VIDEO_BYTES) {
    return { valid: false, error: 'File size exceeds the 500MB limit.' }
  }
  return { valid: true }
}
