const timestamp = () => new Date().toISOString()

const logger = {
  info: (message) => {
    console.log(`${timestamp()} [info]: ${message}`)
  },

  warn: (message) => {
    console.warn(`${timestamp()} [warn]: ${message}`)
  },

  error: (message) => {
    console.error(`${timestamp()} [error]: ${message}`)
  },
}

module.exports = logger