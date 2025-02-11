const Redis = require('ioredis');
const config = require('./config');

class GatewayCache {
  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    });

    this.redis.on('error', (error) => {
      console.error('Gateway Cache Redis Error:', error);
    });
  }

  // Cache key generator based on request
  generateKey(req) {
    const { baseUrl, path, method, query } = req;
    const sortedQuery = Object.keys(query)
      .sort()
      .reduce((acc, key) => {
        acc[key] = query[key];
        return acc;
      }, {});

    return `gateway:${method}:${baseUrl}${path}:${JSON.stringify(sortedQuery)}`;
  }

  // Get cached response
  async get(key) {
    try {
      const cached = await this.redis.get(key);
      if (cached) {
        return JSON.parse(cached);
      }
      return null;
    } catch (error) {
      console.error('Cache Get Error:', error);
      return null;
    }
  }

  // Set cache with TTL
  async set(key, value, ttl = config.cache.defaultTTL) {
    try {
      await this.redis.set(key, JSON.stringify(value), 'EX', ttl);
    } catch (error) {
      console.error('Cache Set Error:', error);
    }
  }

  // Clear cache by pattern
  async clear(pattern) {
    try {
      const keys = await this.redis.keys(`gateway:${pattern}*`);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error('Cache Clear Error:', error);
    }
  }
}

module.exports = new GatewayCache(); 