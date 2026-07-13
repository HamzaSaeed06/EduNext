const mongoose = require('mongoose')
const logger = require('./logger')

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/edunext'
  const conn = await mongoose.connect(uri)
  logger.info(`MongoDB connected: ${conn.connection.host}`)
}

module.exports = connectDB
