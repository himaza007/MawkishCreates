// Loads environment variables from the .env file
require('dotenv').config()
// Imports the Express application from app.js and the custom logger utility
const app              = require('./app')
const logger           = require('./utils/logger')

const PORT = process.env.PORT || 5000

// Starts the Express server
const server = app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`)
})

/* Graceful shutdown */
const shutdown = (signal) => {
  logger.info(`${signal} received — shutting down gracefully`)

  // Stops accepting new requests and closes existing connections
  server.close(() => {
    logger.info('Server closed')
    process.exit(0)
  })
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT',  () => shutdown('SIGINT'))

/* Unhandled promise rejections */
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`)
  server.close(() => process.exit(1))
})

