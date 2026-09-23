# Production Deployment Guide

## Task 27: Production Build and Documentation

## Prerequisites

### System Requirements
- Node.js 18+ LTS
- PostgreSQL 14+
- Redis 7+
- Docker & Docker Compose (recommended)
- 2GB+ RAM minimum
- 20GB+ disk space

### Required Services
- PostgreSQL database
- Redis instance
- SMTP server (for email notifications)
- SSL certificates (Let's Encrypt recommended)
- Domain name with DNS configured

## Environment Configuration

### 1. Environment Variables

Create `.env` files for each environment:

```bash
# .env.production

# Application
NODE_ENV=production
PORT=3000
CLIENT_URL=https://rewritebot.com
API_URL=https://api.rewritebot.com

# Database
DATABASE_URL="postgresql://user:password@postgres:5432/rewritebot?schema=public"

# Redis
REDIS_URL="redis://redis:6379"

# Security
JWT_SECRET="your-super-secret-jwt-key-min-256-bits"
JWT_REFRESH_SECRET="your-refresh-token-secret-min-256-bits"
ENCRYPTION_KEY="your-32-byte-hex-encryption-key"

# Rate Limiting
RATE_LIMIT_AUTH_MAX=5
RATE_LIMIT_AUTH_WINDOW=900000
RATE_LIMIT_API_MAX=100
RATE_LIMIT_API_WINDOW=900000

# CORS
CORS_ORIGIN="https://rewritebot.com"

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=/var/log/rewritebot

# Email (Optional)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=notifications@rewritebot.com
SMTP_PASS=your-smtp-password
SMTP_FROM="RewriteBot <notifications@rewritebot.com>"
```

### 2. Generate Secrets

```bash
# Generate JWT secret (256-bit)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate encryption key (256-bit)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate refresh token secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Build Process

### 1. Install Dependencies

```bash
# Root dependencies
npm install

# Install workspace dependencies
npm install --workspaces

# Production dependencies only
npm install --production --workspaces
```

### 2. Build Applications

```bash
# Build shared package first
cd shared
npm run build

# Build server
cd ../server
npm run build

# Build client
cd ../client
npm run build

# Or build all from root
npm run build --workspaces
```

### 3. Database Migration

```bash
# Generate Prisma client
cd server
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Optional: Seed initial data
npm run db:seed
```

### 4. Validate Build

```bash
# Check build output
ls -la server/dist/
ls -la client/dist/

# Test server build
cd server
node dist/index.js

# Verify client build
cd client
npx serve -s dist -p 5173
```

## Docker Deployment (Recommended)

### 1. Production Docker Compose

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    restart: always
    environment:
      POSTGRES_DB: rewritebot
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - backend

  redis:
    image: redis:7-alpine
    restart: always
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - backend

  server:
    build:
      context: .
      dockerfile: server/Dockerfile
      target: production
    restart: always
    env_file:
      - .env.production
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    ports:
      - "3000:3000"
    volumes:
      - ./logs:/var/log/rewritebot
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - backend
      - frontend
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '1'
        reservations:
          memory: 512M
          cpus: '0.5'

  client:
    build:
      context: .
      dockerfile: client/Dockerfile
      target: production
    restart: always
    depends_on:
      - server
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - ./nginx/nginx.prod.conf:/etc/nginx/nginx.conf:ro
    networks:
      - frontend
    deploy:
      resources:
        limits:
          memory: 256M
          cpus: '0.5'

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local

networks:
  backend:
    driver: bridge
  frontend:
    driver: bridge
```

### 2. Production Dockerfiles

**Server Dockerfile**:
```dockerfile
# server/Dockerfile
FROM node:18-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# Dependencies
FROM base AS deps
COPY package*.json ./
COPY server/package*.json ./server/
COPY shared/package*.json ./shared/
RUN npm ci --workspace=server --workspace=shared

# Builder
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/server/node_modules ./server/node_modules
COPY --from=deps /app/shared/node_modules ./shared/node_modules
COPY . .
RUN npm run build --workspace=shared
RUN npm run build --workspace=server
RUN cd server && npx prisma generate

# Production
FROM base AS production
ENV NODE_ENV=production
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

COPY --from=builder --chown=nodejs:nodejs /app/server/dist ./server/dist
COPY --from=builder --chown=nodejs:nodejs /app/server/node_modules ./server/node_modules
COPY --from=builder --chown=nodejs:nodejs /app/shared/dist ./shared/dist
COPY --from=builder --chown=nodejs:nodejs /app/server/prisma ./server/prisma

WORKDIR /app/server
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

CMD ["node", "dist/index.js"]
```

**Client Dockerfile**:
```dockerfile
# client/Dockerfile
FROM node:18-alpine AS base
WORKDIR /app

# Dependencies
FROM base AS deps
COPY package*.json ./
COPY client/package*.json ./client/
COPY shared/package*.json ./shared/
RUN npm ci --workspace=client --workspace=shared

# Builder
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/client/node_modules ./client/node_modules
COPY --from=deps /app/shared/node_modules ./shared/node_modules
COPY . .
RUN npm run build --workspace=shared
RUN npm run build --workspace=client

# Production with Nginx
FROM nginx:alpine AS production
COPY --from=builder /app/client/dist /usr/share/nginx/html
COPY client/nginx.prod.conf /etc/nginx/nginx.conf

EXPOSE 80 443

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

### 3. Production Nginx Configuration

```nginx
# client/nginx.prod.conf
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 10M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/javascript application/json;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

    # HTTP redirect to HTTPS
    server {
        listen 80;
        server_name rewritebot.com www.rewritebot.com;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name rewritebot.com www.rewritebot.com;

        # SSL certificates
        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;

        # HSTS
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # Root directory
        root /usr/share/nginx/html;
        index index.html;

        # Static assets with caching
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # API proxy
        location /api/ {
            proxy_pass http://server:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            
            # Timeouts for long-running AI requests
            proxy_connect_timeout 60s;
            proxy_send_timeout 120s;
            proxy_read_timeout 120s;
        }

        # Health check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }

        # SPA fallback
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Error pages
        error_page 404 /404.html;
        error_page 500 502 503 504 /50x.html;
    }
}
```

### 4. Deploy with Docker Compose

```bash
# Pull latest images
docker-compose -f docker-compose.prod.yml pull

# Build images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Run migrations
docker-compose -f docker-compose.prod.yml exec server npx prisma migrate deploy

# Scale server (if needed)
docker-compose -f docker-compose.prod.yml up -d --scale server=3
```

## Manual Deployment (VPS/Bare Metal)

### 1. Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Redis
sudo apt install -y redis-server

# Install Nginx
sudo apt install -y nginx

# Install PM2 for process management
sudo npm install -g pm2
```

### 2. Setup Database

```bash
# Create database
sudo -u postgres psql
CREATE DATABASE rewritebot;
CREATE USER rewritebot_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE rewritebot TO rewritebot_user;
\q
```

### 3. Deploy Application

```bash
# Clone repository
git clone https://github.com/yourusername/rewritebot.git /var/www/rewritebot
cd /var/www/rewritebot

# Install and build
npm install
npm run build

# Run migrations
cd server
npx prisma migrate deploy
cd ..

# Setup PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 4. PM2 Configuration

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'rewritebot-api',
      script: './server/dist/index.js',
      cwd: '/var/www/rewritebot/server',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '/var/log/rewritebot/api-error.log',
      out_file: '/var/log/rewritebot/api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_memory_restart: '1G',
      autorestart: true,
      watch: false,
    },
  ],
};
```

### 5. Nginx Configuration

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/rewritebot

# Enable site
sudo ln -s /etc/nginx/sites-available/rewritebot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## SSL Certificate Setup

### Using Let's Encrypt (Certbot)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d rewritebot.com -d www.rewritebot.com

# Auto-renewal
sudo certbot renew --dry-run

# Setup auto-renewal cron
echo "0 3 * * * certbot renew --quiet" | sudo tee -a /etc/crontab
```

## Database Backup

### Automated Backup Script

```bash
#!/bin/bash
# /usr/local/bin/backup-rewritebot.sh

BACKUP_DIR="/backups/rewritebot"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="rewritebot"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
pg_dump -U rewritebot_user $DB_NAME | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup Redis
redis-cli --rdb $BACKUP_DIR/redis_$DATE.rdb

# Remove backups older than 30 days
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete
find $BACKUP_DIR -name "*.rdb" -mtime +30 -delete

echo "Backup completed: $DATE"
```

```bash
# Make executable
sudo chmod +x /usr/local/bin/backup-rewritebot.sh

# Setup cron (daily at 2 AM)
echo "0 2 * * * /usr/local/bin/backup-rewritebot.sh" | sudo tee -a /etc/crontab
```

## Monitoring

### Health Check Endpoints

```typescript
// server/src/routes/health.ts
export async function healthRoutes(fastify: FastifyInstance) {
  // Basic health check
  fastify.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }));

  // Detailed health check
  fastify.get('/health/detailed', async () => {
    const [dbHealth, redisHealth] = await Promise.all([
      checkDatabase(),
      checkRedis(),
    ]);

    return {
      status: dbHealth && redisHealth ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealth ? 'up' : 'down',
        redis: redisHealth ? 'up' : 'down',
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  });
}

async function checkDatabase(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

async function checkRedis(): Promise<boolean> {
  try {
    await redis.ping();
    return true;
  } catch {
    return false;
  }
}
```

### Monitoring Setup

```bash
# Install monitoring tools
npm install --save prom-client

# Setup Prometheus metrics endpoint
# server/src/metrics/prometheus.ts
```

### Uptime Monitoring

Use services like:
- **UptimeRobot** - Free uptime monitoring
- **Pingdom** - Advanced monitoring
- **StatusCake** - SSL certificate monitoring
- **DataDog** - Full APM solution

## Scaling Strategy

### Horizontal Scaling

```yaml
# docker-compose.scale.yml
services:
  server:
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
```

### Load Balancer (Nginx)

```nginx
# Load balancing configuration
upstream backend {
    least_conn;
    server server1:3000 weight=3;
    server server2:3000 weight=2;
    server server3:3000 weight=1;
    keepalive 32;
}

server {
    location /api/ {
        proxy_pass http://backend;
        # ... other proxy settings
    }
}
```

### Database Scaling

```yaml
# Read replicas
services:
  postgres-primary:
    image: postgres:14-alpine
    # Primary configuration

  postgres-replica:
    image: postgres:14-alpine
    # Replica configuration with replication
```

## Rollback Strategy

### Version Tagging

```bash
# Tag releases
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# Build specific version
docker build -t rewritebot:v1.0.0 .
```

### Rollback Procedure

```bash
# Stop current version
docker-compose -f docker-compose.prod.yml down

# Restore database backup
gunzip < /backups/rewritebot/db_YYYYMMDD_HHMMSS.sql.gz | psql -U rewritebot_user rewritebot

# Deploy previous version
docker-compose -f docker-compose.prod.yml up -d

# Or with PM2
pm2 stop rewritebot-api
git checkout v1.0.0
npm install
npm run build
pm2 restart rewritebot-api
```

## CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    tags:
      - 'v*'

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci --workspaces
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build --workspaces
      
      - name: Build Docker images
        run: |
          docker build -t rewritebot-server:${{ github.ref_name }} -f server/Dockerfile .
          docker build -t rewritebot-client:${{ github.ref_name }} -f client/Dockerfile .
      
      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push rewritebot-server:${{ github.ref_name }}
          docker push rewritebot-client:${{ github.ref_name }}
      
      - name: Deploy to production
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.PRODUCTION_HOST }}
          username: ${{ secrets.PRODUCTION_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/rewritebot
            docker-compose -f docker-compose.prod.yml pull
            docker-compose -f docker-compose.prod.yml up -d
```

## Security Checklist

- [ ] All secrets in environment variables
- [ ] HTTPS/TLS enabled
- [ ] Firewall configured (only 80, 443 open)
- [ ] Database not publicly accessible
- [ ] Redis protected with password
- [ ] Regular security updates
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Security headers enabled
- [ ] File upload limits set
- [ ] Error messages sanitized
- [ ] Logging without sensitive data
- [ ] Backup encryption enabled
- [ ] SSH key-based authentication

## Performance Checklist

- [ ] Database indexes optimized
- [ ] Redis caching implemented
- [ ] Gzip compression enabled
- [ ] Static assets cached
- [ ] CDN configured (optional)
- [ ] Database connection pooling
- [ ] API response compression
- [ ] Image optimization
- [ ] Code minification
- [ ] Lazy loading implemented

## Post-Deployment

### Smoke Tests

```bash
# Test health endpoint
curl https://api.rewritebot.com/health

# Test authentication
curl -X POST https://api.rewritebot.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@rewritebot.com","password":"demo123456"}'

# Test paraphrase (with token)
curl -X POST https://api.rewritebot.com/api/v1/paraphrase \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text":"Test","mode":"standard","providerId":"...","modelId":"..."}'
```

### Monitoring Dashboard

Setup monitoring:
1. Server logs: `tail -f /var/log/rewritebot/api-out.log`
2. Error logs: `tail -f /var/log/rewritebot/api-error.log`
3. Nginx logs: `tail -f /var/log/nginx/access.log`
4. Database logs: `sudo tail -f /var/log/postgresql/postgresql-14-main.log`

## Troubleshooting

### Common Issues

**Port already in use**:
```bash
sudo lsof -i :3000
sudo kill -9 <PID>
```

**Database connection failed**:
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection
psql -U rewritebot_user -d rewritebot -h localhost
```

**Redis connection failed**:
```bash
# Check Redis status
sudo systemctl status redis

# Test connection
redis-cli ping
```

**Out of memory**:
```bash
# Check memory usage
free -h
docker stats

# Increase swap
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

## Support & Maintenance

### Update Procedure

```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm install

# Run migrations
cd server && npx prisma migrate deploy

# Rebuild
npm run build --workspaces

# Restart services
pm2 restart all
# OR
docker-compose -f docker-compose.prod.yml up -d --build
```

### Log Rotation

```bash
# /etc/logrotate.d/rewritebot
/var/log/rewritebot/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 nodejs nodejs
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

---

**Deployment Target**: Zero-downtime deployment with <5min rollback capability
**Monitoring**: 24/7 uptime monitoring with alerts
**Backup**: Daily automated backups with 30-day retention
**Support**: Production issue response within 2 hours
