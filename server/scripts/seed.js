/**
 * Seed script — creates a default admin plus a few instructor/student
 * accounts directly in the configured MongoDB database, so there are
 * real, working credentials to sign in with while testing the app.
 *
 * Usage: node scripts/seed.js   (run from the server/ directory)
 *
 * Safe to re-run: existing users (matched by email) are left untouched
 * unless --force is passed, in which case their password is reset to the
 * default below.
 */
require('dotenv').config()
const mongoose = require('mongoose')
const User = require('../src/models/User')
const logger = require('../src/config/logger')

const FORCE = process.argv.includes('--force')

const SEED_USERS = [
  { name: 'Admin User', email: 'admin@edunext.dev', password: 'Admin@1234', role: 'admin', isEmailVerified: true },
  { name: 'Grace Instructor', email: 'instructor1@edunext.dev', password: 'Instruct@1234', role: 'instructor', isEmailVerified: true },
  { name: 'Sam Instructor', email: 'instructor2@edunext.dev', password: 'Instruct@1234', role: 'instructor', isEmailVerified: true },
  { name: 'Alex Student', email: 'student1@edunext.dev', password: 'Student@1234', role: 'student', isEmailVerified: true },
  { name: 'Riya Student', email: 'student2@edunext.dev', password: 'Student@1234', role: 'student', isEmailVerified: true },
]

async function run() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not set — aborting seed.')
    process.exit(1)
  }

  await mongoose.connect(process.env.MONGODB_URI)
  logger.info('[seed] Connected to MongoDB')

  const results = []
  for (const u of SEED_USERS) {
    const existing = await User.findOne({ email: u.email })
    if (existing) {
      if (FORCE) {
        existing.password = u.password
        existing.role = u.role
        existing.isEmailVerified = u.isEmailVerified
        await existing.save()
        results.push({ ...u, status: 'reset (--force)' })
      } else {
        results.push({ ...u, status: 'already exists — skipped' })
      }
      continue
    }
    await User.create(u)
    results.push({ ...u, status: 'created' })
  }

  console.log('\nSeed results:')
  console.table(results.map(({ password, ...rest }) => ({ ...rest, password })))

  await mongoose.disconnect()
  logger.info('[seed] Done, disconnected from MongoDB')
}

run().catch((err) => {
  console.error('[seed] Failed:', err)
  process.exit(1)
})
