# Performance Optimization Guide

## Current Performance Status

### ✅ Implemented Optimizations
- **Database connection pooling** via Prisma
- **Redis caching** for rate limiting and health checks
- **Server-Sent Events** for streaming (lightweight vs WebSockets)
- **Debounced autosave** (2-second delay)
- **Pagination** for large datasets (documents, history)
- **Docker multi-stage builds** for smaller images
- **TypeScript compilation** with optimizations

### 🎯 Performance Targets
- API response time: < 200ms (p95)
- AI generation start: < 1s
- Page load: < 2s
- Time to Interactive: < 3s
- Database queries: < 50ms (p95)
- Memory usage: < 512MB per container

## Task 24: Performance Optimization Strategy

### 1. Database Query Optimization

#### Current Queries to Optimize

**Add indexes for common queries**:
```prisma
// prisma/schema.prisma - Add these indexes

model Document {
  // ... existing fields
  
  @@index([userId, isArchived])
  @@index([userId, isFavorite])
  @@index([userId, updatedAt])
  @@index([title]) // For search
}

model HistoryEvent {
  // ... existing fields
  
  @@index([userId, operation])
  @@index([userId, createdAt])
  @@index([providerId, success])
}

model Provider {
  // ... existing fields
  
  @@index([userId, isDefault])
  @@index([type])
}
```

**Optimize N+1 queries**:
```typescript
// BEFORE: N+1 query problem
const documents = await prisma.document.findMany({ where: { userId } });
for (const doc of documents) {
  const versions = await prisma.documentVersion.findMany({ 
    where: { documentId: doc.id } 
  });
}

// AFTER: Single query with include
const documents = await prisma.document.findMany({
  where: { userId },
  include: {
    versions: {
      take: 5,
      orderBy: { createdAt: 'desc' },
    },
  },
});
```

**Use select to fetch only needed fields**:
```typescript
// BEFORE: Fetching all fields
const user = await prisma.user.findUnique({ where: { id } });

// AFTER: Select specific fields
const user = await prisma.user.findUnique({
  where: { id },
  select: {
    id: true,
    email: true,
    name: true,
    // Skip hashedPassword, etc.
  },
});
```

### 2. Redis Caching Strategy

#### Cache Layer Implementation

```typescript
// server/src/cache/CacheService.ts
import { redis } from '../config/redis';

export class CacheService {
  /**
   * Provider health cache (5 minutes)
   */
  async cacheProviderHealth(providerId: string, health: any): Promise<void> {
    await redis.setex(
      `provider:health:${providerId}`,
      300, // 5 minutes
      JSON.stringify(health)
    );
  }

  async getProviderHealth(providerId: string): Promise<any | null> {
    const cached = await redis.get(`provider:health:${providerId}`);
    return cached ? JSON.parse(cached) : null;
  }

  /**
   * Provider models cache (1 hour)
   */
  async cacheProviderModels(providerId: string, models: any[]): Promise<void> {
    await redis.setex(
      `provider:models:${providerId}`,
      3600, // 1 hour
      JSON.stringify(models)
    );
  }

  async getProviderModels(providerId: string): Promise<any[] | null> {
    const cached = await redis.get(`provider:models:${providerId}`);
    return cached ? JSON.parse(cached) : null;
  }

  /**
   * User preferences cache (10 minutes)
   */
  async cacheUserPreferences(userId: string, prefs: any): Promise<void> {
    await redis.setex(
      `user:prefs:${userId}`,
      600,
      JSON.stringify(prefs)
    );
  }

  /**
   * Invalidate user cache
   */
  async invalidateUserCache(userId: string): Promise<void> {
    const keys = await redis.keys(`user:*:${userId}`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}
```

#### Cache-Aside Pattern
```typescript
// Example usage in ProvidersService
async getProviderModels(providerId: string): Promise<Model[]> {
  // Try cache first
  const cached = await cacheService.getProviderModels(providerId);
  if (cached) {
    return cached;
  }

  // Cache miss - fetch from provider
  const models = await provider.listModels();
  
  // Store in cache
  await cacheService.cacheProviderModels(providerId, models);
  
  return models;
}
```

### 3. Frontend Performance

#### Code Splitting & Lazy Loading

```typescript
// client/src/app/Router.tsx
import { lazy, Suspense } from 'react';

const Editor = lazy(() => import('../pages/Editor'));
const Documents = lazy(() => import('../pages/Documents'));
const Settings = lazy(() => import('../pages/Settings'));
const History = lazy(() => import('../pages/History'));

export function Router() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Editor />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </Suspense>
  );
}
```

#### Virtual Scrolling for Large Lists

```bash
npm install react-window
```

```typescript
// For document/history lists with 100+ items
import { FixedSizeList } from 'react-window';

function DocumentList({ documents }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      <DocumentItem document={documents[index]} />
    </div>
  );

  return (
    <FixedSizeList
      height={600}
      itemCount={documents.length}
      itemSize={80}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
```

#### Image Optimization

```typescript
// Use modern formats
<picture>
  <source srcSet="image.webp" type="image/webp" />
  <source srcSet="image.jpg" type="image/jpeg" />
  <img src="image.jpg" alt="Description" loading="lazy" />
</picture>
```

#### Bundle Size Optimization

```bash
# Analyze bundle
npm run build
npx vite-bundle-visualizer

# Tree-shaking optimization
# Import only what you need
import { Button } from 'bootstrap'; // ❌ imports everything
import Button from 'bootstrap/js/dist/button'; // ✅ specific import
```

### 4. API Response Optimization

#### Response Compression

```typescript
// server/src/index.ts
import compress from '@fastify/compress';

await server.register(compress, {
  encodings: ['gzip', 'deflate'],
  threshold: 1024, // Only compress responses > 1KB
});
```

#### Streaming Large Responses

```typescript
// For large document exports
async exportLargeDocument(request, reply) {
  const stream = createReadStream(filePath);
  
  reply.headers({
    'Content-Type': 'application/octet-stream',
    'Content-Disposition': `attachment; filename="${filename}"`,
  });
  
  return reply.send(stream);
}
```

#### ETags for Caching

```typescript
// Add ETag support
import etag from '@fastify/etag';

await server.register(etag);
```

### 5. Database Connection Tuning

```typescript
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Connection pool settings
  connection_limit = 10
  pool_timeout = 20
  connect_timeout = 10
}
```

**Monitor connection pool**:
```typescript
// Add metrics endpoint
fastify.get('/metrics/db', async () => {
  const metrics = await prisma.$metrics.json();
  return metrics;
});
```

### 6. AI Provider Performance

#### Request Batching

```typescript
// Batch multiple similar requests
class RequestBatcher {
  private queue: Array<{ request: any; resolve: any; reject: any }> = [];
  private timeout: NodeJS.Timeout | null = null;

  add(request: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.queue.push({ request, resolve, reject });
      
      if (!this.timeout) {
        this.timeout = setTimeout(() => this.flush(), 50);
      }
    });
  }

  private async flush() {
    const batch = this.queue.splice(0);
    this.timeout = null;
    
    // Process batch...
  }
}
```

#### Timeout Configuration

```typescript
// Set aggressive timeouts for AI requests
const AI_REQUEST_TIMEOUT = {
  connection: 5000, // 5s to establish connection
  response: 30000,  // 30s for response
  streaming: 120000, // 2m for streaming
};
```

### 7. Memory Management

#### Monitor Memory Usage

```typescript
// Add memory metrics
fastify.get('/metrics/memory', () => {
  const usage = process.memoryUsage();
  return {
    rss: `${Math.round(usage.rss / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
    heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
    external: `${Math.round(usage.external / 1024 / 1024)}MB`,
  };
});
```

#### Implement Stream Processing

```typescript
// Process large files without loading into memory
import { pipeline } from 'stream/promises';

async function processLargeFile(inputPath: string, outputPath: string) {
  await pipeline(
    createReadStream(inputPath),
    transformStream,
    createWriteStream(outputPath)
  );
}
```

### 8. Load Testing

#### Artillery Load Test Config

```yaml
# load-test.yml
config:
  target: "http://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Sustained load"
    - duration: 60
      arrivalRate: 100
      name: "Peak load"
  
scenarios:
  - name: "Paraphrase flow"
    flow:
      - post:
          url: "/api/v1/auth/login"
          json:
            email: "demo@rewritebot.com"
            password: "demo123456"
          capture:
            - json: "$.accessToken"
              as: "token"
      - post:
          url: "/api/v1/paraphrase"
          headers:
            Authorization: "Bearer {{ token }}"
          json:
            text: "Test text for paraphrasing"
            mode: "standard"
            providerId: "{{ providerId }}"
            modelId: "gpt-3.5-turbo"
```

```bash
# Run load test
npm install -g artillery
artillery run load-test.yml
```

### 9. CDN & Static Assets

#### Frontend Asset Optimization

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['bootstrap', 'lucide-react'],
          'store-vendor': ['zustand'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
```

#### CDN Configuration (Production)

```nginx
# Serve static assets via CDN
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}
```

### 10. Monitoring & Profiling

#### Application Performance Monitoring (APM)

**Option 1: New Relic**
```typescript
require('newrelic');
import fastify from 'fastify';
// ... rest of app
```

**Option 2: DataDog**
```bash
npm install dd-trace
```

```typescript
import tracer from 'dd-trace';
tracer.init();
```

#### Custom Metrics

```typescript
// Track custom metrics
class MetricsCollector {
  private metrics: Map<string, number[]> = new Map();

  record(metric: string, value: number) {
    if (!this.metrics.has(metric)) {
      this.metrics.set(metric, []);
    }
    this.metrics.get(metric)!.push(value);
  }

  getStats(metric: string) {
    const values = this.metrics.get(metric) || [];
    return {
      count: values.length,
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      p95: this.percentile(values, 95),
      p99: this.percentile(values, 99),
    };
  }

  private percentile(arr: number[], p: number): number {
    const sorted = arr.sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[index];
  }
}
```

## Performance Checklist

### Database
- [ ] Add indexes for common queries
- [ ] Optimize N+1 queries
- [ ] Use select for specific fields
- [ ] Configure connection pooling
- [ ] Monitor slow queries

### Caching
- [ ] Implement Redis caching layer
- [ ] Cache provider health/models
- [ ] Cache user preferences
- [ ] Add cache invalidation logic
- [ ] Monitor cache hit rates

### Frontend
- [ ] Implement code splitting
- [ ] Add lazy loading
- [ ] Virtual scrolling for lists
- [ ] Optimize bundle size
- [ ] Image optimization
- [ ] Service worker for offline

### API
- [ ] Response compression
- [ ] ETag support
- [ ] Streaming for large responses
- [ ] Request batching
- [ ] Aggressive timeouts

### Infrastructure
- [ ] CDN for static assets
- [ ] Load balancing
- [ ] Horizontal scaling
- [ ] Database read replicas
- [ ] Redis clustering

### Monitoring
- [ ] APM integration
- [ ] Custom metrics
- [ ] Performance alerts
- [ ] Load testing
- [ ] Memory profiling

## Performance Metrics to Track

```typescript
// Key metrics dashboard
{
  api: {
    requestsPerSecond: 150,
    averageResponseTime: 95, // ms
    p95ResponseTime: 180,
    p99ResponseTime: 450,
    errorRate: 0.02, // 2%
  },
  database: {
    activeConnections: 8,
    averageQueryTime: 12, // ms
    slowQueries: 3, // per hour
    connectionPoolUtilization: 0.7,
  },
  cache: {
    hitRate: 0.85, // 85%
    missRate: 0.15,
    averageLatency: 2, // ms
  },
  ai: {
    averageGenerationTime: 2500, // ms
    streamingLatency: 800, // ms to first token
    providerErrorRate: 0.01,
  },
  infrastructure: {
    cpuUsage: 45, // %
    memoryUsage: 320, // MB
    diskIO: 15, // MB/s
    networkIO: 5, // MB/s
  },
}
```

## Optimization Priorities

**High Priority**:
1. Database query optimization
2. Redis caching implementation
3. API response compression
4. Frontend code splitting

**Medium Priority**:
5. Virtual scrolling
6. Request batching
7. CDN setup
8. Load testing

**Low Priority**:
9. Advanced caching strategies
10. Database read replicas
11. Horizontal scaling prep

---

**Target**: Achieve < 200ms API response (p95) and < 2s page load
**Tools**: Artillery, Lighthouse, Chrome DevTools, DataDog/New Relic
**Review**: Monthly performance audits
