# eCFR Explorer Deployment Guide

## Architecture Overview

The eCFR Explorer consists of 5 microservices:
- API Gateway (Port 3000)
- Agency Service (Port 3002)
- Search Service (Port 3003)
- Versioner Service (Port 3004)
- Cache Service (Port 3001)

Supporting infrastructure:
- Redis for caching
- MongoDB for data persistence
- Docker for containerization
- Docker Compose for orchestration

## Prerequisites

Install required tools:
- Docker 20.10+
- Docker Compose 2.0+
- Node.js 18+ (for local development)
- Redis 6+ (for local development)
- MongoDB 5+ (for local development)

## Environment Setup

1. Create environment files: 

```bash
cp .env.development .env
cp .env.example .env.staging
cp .env.example .env.production
```

2. Configure environment variables in each .env file:

```bash
nano .env
```

NODE_ENV=<environment>
PORT=3000
REDIS_HOST=<redis-host>
REDIS_PORT=6379
MONGODB_URI=<mongodb-uri>

## Development Deployment

Start the development environment:
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

Services will be available at:
- Agency service: http://localhost:3002
- Search service: http://localhost:3003
- Versioner service: http://localhost:3004
- Cache service: http://localhost:3001

## Staging Deployment
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
Deploy to staging:
```bash
./scripts/deploy.sh staging
```

The script will:
1. Build Docker images
2. Push to container registry
3. Deploy services
4. Run database migrations
5. Initialize cache

## Production Deployment

Deploy to production:
```bash
./scripts/deploy.sh production
```

Production deployment uses Docker Swarm for orchestration:
1. Images are pulled from private registry
2. Services are deployed with replication
3. Rolling updates are performed
4. Health checks ensure availability

## Monitoring

Health check endpoints:
- /health - Service health status
- /metrics - Prometheus metrics
- /api/cache/stats - Cache statistics

Monitor logs:
```bash
docker-compose logs -f [service]
```

## Scaling

Scale individual services:
```bash
docker-compose up -d --scale service-name=3
```

## Backup and Recovery

Database backup:
```bash
docker-compose exec mongodb mongodump --out /backup
```

Redis backup:
```bash
docker-compose exec redis redis-cli SAVE
```

## Troubleshooting

Common issues:

1. Service unhealthy
```bash
docker-compose ps
docker-compose logs unhealthy-service
```

2. Cache issues
```bash
docker-compose exec api-gateway npm run clear-cache
```

3. Database connection issues
```bash
docker-compose exec mongodb mongosh --eval "db.serverStatus()"
```

## Security Notes

1. Production deployments must:
- Use HTTPS
- Configure firewalls
- Set secure passwords
- Enable authentication
- Use private Docker registry

2. Environment variables:
- Never commit .env files
- Use secrets management
- Rotate credentials regularly

## Maintenance

Regular maintenance tasks:
1. Update dependencies monthly
2. Rotate logs weekly
3. Backup data daily
4. Monitor disk usage
5. Check service health

## Support

For deployment issues:
1. Check service logs
2. Verify configurations
3. Validate environment variables
4. Contact DevOps team

