const axios = require('axios');
const cache = require('./cache');
const config = require('./config');

class CacheWarmer {
  constructor() {
    this.warmupPaths = [
      // Essential data to pre-warm
      { path: '/api/agencies', params: {} },
      { path: '/api/titles', params: {} },
      // Common search queries
      { 
        path: '/api/search', 
        params: { 
          date: new Date().toISOString().split('T')[0],
          per_page: 100 
        } 
      }
    ];
  }

  async warmCache() {
    console.log('Starting cache warm-up...');
    const startTime = Date.now();

    try {
      await Promise.all(
        this.warmupPaths.map(async ({ path, params }) => {
          const response = await axios.get(`http://localhost:${process.env.PORT || 3000}${path}`, {
            params
          });

          const key = cache.generateKey({
            method: 'GET',
            path,
            query: params
          });

          const ttl = config.cache.routes[path]?.ttl || config.cache.defaultTTL;
          await cache.set(key, response.data, ttl);

          console.log(`Warmed cache for ${path}`);
        })
      );

      const duration = Date.now() - startTime;
      console.log(`Cache warm-up completed in ${duration}ms`);
    } catch (error) {
      console.error('Cache warm-up failed:', error);
    }
  }

  // Schedule periodic warm-up
  startPeriodicWarmup(interval = 1800000) { // Default 30 minutes
    setInterval(() => this.warmCache(), interval);
  }
}

module.exports = new CacheWarmer(); 