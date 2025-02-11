module.exports = {
  // Service health check configuration
  healthCheck: {
    interval: 30000, // Check every 30 seconds
    timeout: 5000,   // 5 second timeout
    path: '/health'  // Health check endpoint
  },

  // Circuit breaker configuration
  circuitBreaker: {
    failureThreshold: 5,    // Number of failures before opening
    resetTimeout: 30000,    // Time before attempting to close circuit
    requestTimeout: 10000   // Request timeout
  },

  // CORS configuration
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },

  // Rate limiting configuration
  rateLimit: {
    window: 15 * 60 * 1000, // 15 minutes
    max: 100,               // Max requests per window
    message: 'Too many requests, please try again later'
  },

  // Logging configuration
  logging: {
    format: 'combined',
    options: {
      skip: (req, res) => res.statusCode < 400
    }
  },

  // Cache configuration
  cache: {
    defaultTTL: 300, // 5 minutes
    routes: {
      // Cache configuration for specific routes
      '/api/agencies': {
        ttl: 3600,    // 1 hour
        methods: ['GET']
      },
      '/api/titles': {
        ttl: 1800,    // 30 minutes
        methods: ['GET']
      },
      '/api/search': {
        ttl: 300,     // 5 minutes
        methods: ['GET']
      }
    },
    // Paths that should never be cached
    excludePaths: [
      '/api/cache',
      '/health'
    ]
  }
}; 