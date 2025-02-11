#!/bin/bash

# Set environment
ENV=$1
if [ -z "$ENV" ]; then
  echo "Usage: ./deploy.sh <environment>"
  exit 1
fi

# Load environment variables
source .env.$ENV

# Build and push images
docker-compose -f docker-compose.yml -f docker-compose.$ENV.yml build
docker-compose -f docker-compose.yml -f docker-compose.$ENV.yml push

# Deploy services
if [ "$ENV" = "production" ]; then
  # Production deployment
  docker stack deploy -c docker-compose.yml -c docker-compose.production.yml ecfr
else
  # Development/Staging deployment
  docker-compose -f docker-compose.yml -f docker-compose.$ENV.yml up -d
fi

# Run database migrations
docker-compose exec api-gateway npm run migrate

# Initialize cache
docker-compose exec api-gateway npm run init-cache

echo "Deployment to $ENV complete!" 