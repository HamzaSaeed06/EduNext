import { describe, it, expect } from 'vitest'
import { validateVideoFile, ALLOWED_VIDEO_TYPES, MAX_VIDEO_BYTES } from './videoUpload'

describe('validateVideoFile', () => {
  it('accepts an allowed video type within the size limit', () => {
    const result = validateVideoFile({ type: 'video/mp4', size: 10 * 1024 * 1024 })
    expect(result.valid).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it.each(ALLOWED_VIDEO_TYPES)('accepts %s as a valid mime type', (type) => {
    expect(validateVideoFile({ type, size: 1024 }).valid).toBe(true)
  })

  it('rejects a disallowed file type', () => {
    const result = validateVideoFile({ type: 'application/pdf', size: 1024 })
    expect(result.valid).toBe(false)
    expect(result.error).toMatch(/Invalid file type/)
  })

  it('rejects a file over the 500MB limit', () => {
    const result = validateVideoFile({ type: 'video/mp4', size: MAX_VIDEO_BYTES + 1 })
    expect(result.valid).toBe(false)
    expect(result.error).toMatch(/500MB limit/)
  })

  it('accepts a file exactly at the size limit', () => {
    const result = validateVideoFile({ type: 'video/mp4', size: MAX_VIDEO_BYTES })
    expect(result.valid).toBe(true)
  })
})
