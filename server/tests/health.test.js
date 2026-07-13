const request = require('supertest')
const app = require('../src/app')

describe('GET /api/v1/health', () => {
  it('should return 200 with status ok', async () => {
    const res = await request(app).get('/api/v1/health')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.status).toBe('ok')
  })

  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/api/v1/does-not-exist')
    expect(res.status).toBe(404)
    expect(res.body.success).toBe(false)
  })
})
