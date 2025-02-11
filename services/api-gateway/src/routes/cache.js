const express = require('express');
const router = express.Router();
const cacheWarmer = require('../cacheWarmer');
const cacheInvalidator = require('../cacheInvalidator');
const { isAuthorized } = require('../middleware/auth');

// Warm up the cache manually
router.post('/warmup', isAuthorized, async (req, res) => {
  try {
    await cacheWarmer.warmCache();
    res.json({ message: 'Cache warm-up completed' });
  } catch (error) {
    res.status(500).json({ error: 'Cache warm-up failed' });
  }
});

// Invalidate cache for specific entity
router.post('/invalidate/:entity', isAuthorized, async (req, res) => {
  try {
    const { entity } = req.params;
    const { action, params } = req.body;

    await cacheInvalidator.invalidate(entity, action, params);
    res.json({ message: `Cache invalidated for ${entity}` });
  } catch (error) {
    res.status(500).json({ error: 'Cache invalidation failed' });
  }
});

// Invalidate cache by pattern
router.post('/invalidate-pattern', isAuthorized, async (req, res) => {
  try {
    const { pattern } = req.body;
    await cacheInvalidator.invalidatePattern(pattern);
    res.json({ message: `Cache invalidated for pattern: ${pattern}` });
  } catch (error) {
    res.status(500).json({ error: 'Pattern invalidation failed' });
  }
});

// Get cache statistics
router.get('/stats', isAuthorized, async (req, res) => {
  try {
    const stats = await cache.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get cache statistics' });
  }
});

module.exports = router; 