module.exports = {
  app: {
    port: process.env.PORT || 3000
  },

  services: {
    agency: {
      url: 'http://staging-agency-service:3002'
    },
    search: {
      url: 'http://staging-search-service:3003'
    },
    versioner: {
      url: 'http://staging-versioner-service:3004'
    },
    cache: {
      url: 'http://staging-cache-service:3001'
    }
  },

  redis: {
    host: 'staging-redis',
    password: process.env.REDIS_PASSWORD
  },

  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://staging-mongodb/ecfr'
  },

  cors: {
    origin: ['https://staging.ecfr-explorer.com']
  },

  logging: {
    level: 'info'
  }
}; 