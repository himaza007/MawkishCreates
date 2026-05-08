require('dotenv').config()

const app = require('./app')
const logger = require('./utils/logger')

const PORT = process.env.PORT || 5000

// Locally, we start the server using app.listen().
// On Vercel, the Express app is exported as a serverless function.
if (process.env.VERCEL !== '1') {
  const server = app.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`)
  })

  const shutdown = (signal) => {
    logger.info(`${signal} received — shutting down gracefully`)

    server.close(() => {
      logger.info('Server closed')
      process.exit(0)
    })
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))

  process.on('unhandledRejection', (err) => {
    logger.error(`Unhandled Rejection: ${err.message}`)
    server.close(() => process.exit(1))
  })
}

module.exports = app