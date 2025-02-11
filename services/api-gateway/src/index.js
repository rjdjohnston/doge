const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const { cacheMiddleware, getCacheTTL } = require('./middleware/cache');
const cacheRoutes = require('./routes/cache');
const cacheWarmer = require('./cacheWarmer');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('combined')); // Logging

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Service URLs from environment variables
const services = {
  frontend: process.env.FRONTEND_URL || 'http://frontend:3000',
  admin: process.env.ADMIN_SERVICE_URL || 'http://admin-service:3006',
  search: process.env.SEARCH_SERVICE_URL || 'http://search-service:3003',
  versioner: process.env.VERSIONER_SERVICE_URL || 'http://versioner-service:3004',
  cache: process.env.CACHE_SERVICE_URL || 'http://cache-service:3001'
};

// Proxy configuration
const proxyConfig = {
  changeOrigin: true,
  logLevel: 'error'
};

// Add cache configuration
const cacheConfig = {
  ttl: {
    '/api/agencies': 3600, // 1 hour
    '/api/titles': 10800,  // 3 hours
    '/api/search': 300,    // 5 minutes
    '/api/corrections': 3600, // 1 hour
    default: 300 // 5 minutes default
  }
};

// API routes without cache headers
const apiRoutes = {
  '/api/search/v1/results': {
    target: services.search,
    pathRewrite: {
      '^/api/search/v1/results': '/api/search/v1/results'
    },
    onProxyReq: (proxyReq, req, res) => {
      console.log('Gateway forwarding search request:', {
        originalUrl: req.url,
        targetPath: proxyReq.path,
        query: req.query,
        target: `${services.search}/api/search/v1/results`
      });
    }
  },
  '/api/search': {
    target: services.search,
    pathRewrite: {
      '^/api/search': '/api/search'
    },
    cache: true
  },
  '/api/agencies': {
    target: services.admin,
    pathRewrite: {
      '^/api/agencies': '/api/agencies'
    },
    cache: true  // Enable caching
  },
  '/api/corrections': {
    target: services.admin,
    pathRewrite: {
      '^/api/corrections': '/api/corrections'
    },
    cache: true
  },
  '/api/corrections/title/:titleNumber': {
    target: services.admin,
    pathRewrite: {
      '^/api/corrections/title': '/api/corrections/title'
    },
    onProxyReq: (proxyReq, req, res) => {
      console.log('Gateway forwarding corrections request:', {
        url: req.url,
        params: req.params,
        target: services.admin
      });
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log('Gateway received corrections response:', {
        status: proxyRes.statusCode,
        headers: proxyRes.headers
      });
      // Log the response body
      let responseBody = '';
      proxyRes.on('data', chunk => {
        responseBody += chunk;
      });
      proxyRes.on('end', () => {
        console.log('Gateway corrections response body:', responseBody);
      });
    }
  },
  '/api/titles': {
    target: services.versioner,
    pathRewrite: {
      '^/api/titles': '/api/titles'
    },
    cache: true
  },
};

// Setup API proxy routes
Object.entries(apiRoutes).forEach(([path, config]) => {
  app.use(
    path,
    createProxyMiddleware({
      ...proxyConfig,
      ...config,
      onProxyReq: (proxyReq, req, res) => {
        console.log(`API Gateway forwarding request to: ${config.target}${req.url}`);
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log(`API Gateway received response from: ${config.target}${req.url}`);
        if (config.cache) {
          const ttl = cacheConfig.ttl[req.baseUrl] || cacheConfig.ttl.default;
          proxyRes.headers['cache-control'] = `public, max-age=${ttl}`;
          
          // Log caching info
          console.log(`Caching response for ${req.url} with TTL: ${ttl}`);
        }
      },
      onError: (err, req, res) => {
        console.error('Proxy error:', err);
        res.status(500).json({ error: 'Proxy error', details: err.message });
      }
    })
  );
});

// Cache management routes
app.use('/api/cache', cacheRoutes);

// Frontend proxy - must be after API routes
app.use('/', createProxyMiddleware({
  ...proxyConfig,
  target: services.frontend,
  ws: true, // Enable WebSocket proxy for Next.js HMR
  pathRewrite: {
    '^/': '/'
  }
}));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Gateway Error:', err);
  if (err.code === 'ECONNREFUSED' && err.address === services.cache) {
    console.error('Cache service connection failed');
    // Continue without caching
    return next();
  }
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log('Service routes:');
  Object.entries(apiRoutes).forEach(([path, config]) => {
    console.log(`${path} -> ${config.target}`);
  });
  console.log(`Frontend -> ${services.frontend}`);
}); 