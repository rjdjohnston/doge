const express = require('express');
const mongoose = require('mongoose');
const redis = require('redis');
const { promisify } = require('util');
const { Agency, Title, SearchResult } = require('./models');

const app = express();
const PORT = process.env.PORT || 3001;

// Increase payload size limit to 50mb
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize Redis client
const initRedis = async () => {
  const client = redis.createClient({
    url: `redis://${process.env.REDIS_HOST || 'redis'}:6379`
  });

  client.on('error', (err) => console.error('Redis Client Error:', err));
  client.on('connect', () => console.log('Connected to Redis'));

  await client.connect();
  return client;
};

// MongoDB connection with retries
const connectToMongoDB = async (retries = 5, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongodb:27017/ecfr', {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      console.log('Connected to MongoDB');
      return;
    } catch (err) {
      console.error(`MongoDB connection attempt ${i + 1} failed:`, err);
      if (i === retries - 1) throw err;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

let redisClient;

// Initialize connections and start server
const initializeService = async () => {
  try {
    // Connect to MongoDB
    await connectToMongoDB();
    
    // Initialize Redis
    redisClient = await initRedis();
    
    // Cache endpoints
    app.post('/api/cache', async (req, res) => {
      try {
        const { key, collection, ttl, data } = req.body;
        
        if (!key || !collection || !data) {
          return res.status(400).json({ error: 'Missing required parameters' });
        }

        // Store in Redis with TTL
        await redisClient.set(
          `${collection}:${key}`,
          JSON.stringify(data),
          { EX: ttl || 300 } // Default 5 minutes if no TTL specified
        );

        res.json(data);
      } catch (error) {
        console.error('Cache error:', error);
        res.status(500).json({ error: error.message });
      }
    });

    app.get('/api/cache/:collection/:key', async (req, res) => {
      try {
        const { collection, key } = req.params;
        const data = await redisClient.get(`${collection}:${key}`);
        
        if (!data) {
          return res.status(404).json({ error: 'Cache miss' });
        }

        res.json(JSON.parse(data));
      } catch (error) {
        console.error('Cache error:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({ 
        status: 'ok',
        redis: redisClient.isReady,
        mongodb: mongoose.connection.readyState === 1
      });
    });

    // Start server
    app.listen(PORT, () => {
      console.log(`Cache service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize service:', error);
    process.exit(1);
  }
};

// Start the service
initializeService();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  if (redisClient) {
    await redisClient.quit();
  }
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
  }
  process.exit(0);
});

const CACHE_DURATION = 5 * 60 * 60; // 5 hours in seconds

// Generic cache middleware
const cacheData = async ({ key, collection, fetchFn }) => {
  try {
    // Try Redis first
    const cachedData = await redisClient.get(key);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    // Try MongoDB
    const mongoData = await mongoose.model(collection).findOne({ key });
    if (mongoData) {
      await redisClient.set(key, JSON.stringify(mongoData.data), { EX: CACHE_DURATION });
      return mongoData.data;
    }

    // Fetch from API
    const newData = await fetchFn();
    if (newData) {
      await mongoose.model(collection).create({
        key,
        data: newData,
        lastUpdated: new Date()
      });
      await redisClient.set(key, JSON.stringify(newData), { EX: CACHE_DURATION });
      return newData;
    }

    return null;
  } catch (error) {
    console.error(`Cache error for key ${key}:`, error);
    return null;
  }
};

module.exports = { app, cacheData }; 