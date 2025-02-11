module.exports = {
  app: {
    port: process.env.PORT || 3000
  },

  services: {
    agency: {
      url: 'http://agency-service:3002'
    },
    search: {
      url: 'http://search-service:3003'
    },
    versioner: {
      url: 'http://versioner-service:3004'
    },
    cache: {
      url: 'http://cache-service:3001'
    }
  },

  redis: {
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
    tls: true
  },

  mongodb: {
    uri: process.env.MONGODB_URI,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ssl: true,
      replicaSet: 'rs0',
      authSource: 'admin'
    }
  },

  cors: {
    origin: ['https://ecfr-explorer.com'],
    credentials: true
  },

  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 100,
    headers: true
  },

  logging: {
    level: 'error',
    format: 'combined'
  }
}; 