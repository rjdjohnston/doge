#!/bin/bash

# Wait for dependencies
./scripts/wait-for-it.sh mongodb:27017 -t 60
./scripts/wait-for-it.sh redis:6379 -t 60

# Run migrations
npm run migrate

# Initialize cache
npm run init-cache

# Start the application
if [ "$NODE_ENV" = "development" ]; then
  npm run dev
else
  npm start
fi 