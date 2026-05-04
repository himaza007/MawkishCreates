const mongoose = require('mongoose')
const logger   = require('../utils/logger')

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Mongoose 7+ handles these defaults internally
    })
    logger.info(`MongoDB connected: ${conn.connection.host}`)
  } catch (err) {
    logger.error(`MongoDB connection error: ${err.message}`)
    process.exit(1)
  }
}

// Graceful disconnect helper
const disconnectDB = async () => {
  await mongoose.connection.close()
  logger.info('MongoDB disconnected')
}

module.exports = { connectDB, disconnectDB }
