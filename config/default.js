module.exports = {
  app: {
    name: 'eCFR Explorer',
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development'
  },

  services: {
    agency: {
      url: process.env.AGENCY_SERVICE_URL || 'http://localhost:3002',
      timeout: 5000
    },
    search: {
      url: process.env.SEARCH_SERVICE_URL || 'http://localhost:3003',
      timeout: 10000
    },
    versioner: {
      url: process.env.VERSIONER_SERVICE_URL || 'http://localhost:3004',
      timeout: 15000
    },
    cache: {
      url: process.env.CACHE_SERVICE_URL || 'http://localhost:3001',
      timeout: 3000
    }
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
    db: 0
  },

  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost/ecfr',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },

  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },

  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  },

  cache: {
    defaultTTL: 300, // 5 minutes
    warmupInterval: 1800000, // 30 minutes
    compression: true
  },

  logging: {
    level: 'info',
    format: 'combined'
  }
}; 