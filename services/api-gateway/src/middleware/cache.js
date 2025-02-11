const Redis = require('ioredis');
const cache = require('../cache');
const config = require('../config');

const redis = new Redis({
  host: process.env.REDIS_HOST || 'redis',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

redis.on('connect', () => {
  console.log('Connected to Redis');
});

const getCacheTTL = (req) => {
  const routeConfig = Object.entries(config.cache.routes)
    .find(([path]) => req.path.startsWith(path));

  if (routeConfig) {
    const [, settings] = routeConfig;
    return settings.ttl;
  }

  return config.cache.defaultTTL;
};

const shouldCache = (req) => {
  // Don't cache excluded paths
  if (config.cache.excludePaths.some(path => req.path.startsWith(path))) {
    return false;
  }

  // Check if route has specific cache config
  const routeConfig = Object.entries(config.cache.routes)
    .find(([path]) => req.path.startsWith(path));

  if (routeConfig) {
    const [, settings] = routeConfig;
    return settings.methods.includes(req.method);
  }

  return false;
};

const cacheMiddleware = async (req, res, next) => {
  if (!shouldCache(req)) {
    return next();
  }

  const cacheKey = cache.generateKey(req);

  try {
    const cachedResponse = await cache.get(cacheKey);
    if (cachedResponse) {
      res.set('X-Cache', 'HIT');
      return res.json(cachedResponse);
    }

    // Store original res.json to intercept response
    const originalJson = res.json;
    res.json = function(data) {
      res.set('X-Cache', 'MISS');
      
      // Cache the response
      const ttl = getCacheTTL(req);
      cache.set(cacheKey, data, ttl);

      // Send the response
      return originalJson.call(this, data);
    };

    next();
  } catch (error) {
    console.error('Cache Middleware Error:', error);
    next();
  }
};

module.exports = {
  cacheMiddleware,
  getCacheTTL
}; 