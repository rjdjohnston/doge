const config = require('config');
const dotenv = require('dotenv');

// Load environment variables
const envFile = `.env.${process.env.NODE_ENV || 'development'}`;
dotenv.config({ path: envFile });

// Validate required environment variables
const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'REDIS_HOST',
  'MONGODB_URI'
];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});

// Export merged configuration
module.exports = config; 