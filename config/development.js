module.exports = {
  app: {
    port: 3000
  },

  logging: {
    level: 'debug',
    format: 'dev'
  },

  cache: {
    defaultTTL: 60, // 1 minute for development
    warmupInterval: 300000 // 5 minutes
  },

  rateLimit: {
    max: 1000 // Higher limit for development
  }
}; 