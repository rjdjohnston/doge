const cache = require('./cache');
const config = require('./config');

class CacheInvalidator {
  constructor() {
    this.invalidationRules = {
      // When agencies are updated, invalidate related caches
      'agencies': [
        '/api/agencies',
        '/api/search'
      ],
      // When titles are updated, invalidate related caches
      'titles': [
        '/api/titles',
        '/api/search',
        (titleNumber) => `/api/titles/${titleNumber}`
      ],
      // When search data is updated
      'search': [
        '/api/search',
        '/api/search/suggestions'
      ]
    };
  }

  // Invalidate cache based on entity and action
  async invalidate(entity, action, params = {}) {
    console.log(`Invalidating cache for ${entity} - ${action}`, params);

    const patterns = this.invalidationRules[entity] || [];
    
    try {
      for (const pattern of patterns) {
        if (typeof pattern === 'function') {
          const dynamicPattern = pattern(params);
          await cache.clear(dynamicPattern);
        } else {
          await cache.clear(pattern);
        }
      }

      console.log(`Cache invalidation completed for ${entity}`);
    } catch (error) {
      console.error('Cache invalidation failed:', error);
    }
  }

  // Invalidate cache by specific pattern
  async invalidatePattern(pattern) {
    try {
      await cache.clear(pattern);
      console.log(`Cache invalidated for pattern: ${pattern}`);
    } catch (error) {
      console.error('Pattern invalidation failed:', error);
    }
  }
}

module.exports = new CacheInvalidator(); 