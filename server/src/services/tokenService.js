const jwt = require('jsonwebtoken')

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'dev_access_secret'
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret'
const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || '15m'
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || '7d'

const generateAccessToken = (payload) =>
  jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES })

const generateRefreshToken = (payload) =>
  jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES })

const verifyAccessToken = (token) => jwt.verify(token, ACCESS_SECRET)

const verifyRefreshToken = (token) => jwt.verify(token, REFRESH_SECRET)

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
}
