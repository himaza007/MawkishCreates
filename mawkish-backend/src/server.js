require('dotenv').config()
const app              = require('./app')
const { connectDB }    = require('./config/db')
const { disconnectDB } = require('./config/db')
const logger           = require('./utils/logger')

const PORT = process.env.PORT || 5000

const startServer = async () => {
  await connectDB()

  const server = app.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`)
  })

  /* Graceful shutdown */
  const shutdown = async (signal) => {
    logger.info(`${signal} received — shutting down gracefully`)
    server.close(async () => {
      await disconnectDB()
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
}

startServer()
