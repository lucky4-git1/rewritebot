FROM node:18-alpine AS base

# Stage 1: Install all dependencies using npm workspaces
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy root package and all workspace package manifests
COPY package.json package-lock.json ./
COPY shared/package.json ./shared/package.json
COPY server/package.json ./server/package.json
COPY client/package.json ./client/package.json

# Install dependencies deterministically
RUN npm ci

# Stage 2: Build applications
FROM base AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy dependencies and package files
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/shared/package.json ./shared/package.json
COPY --from=deps /app/server/package.json ./server/package.json
COPY --from=deps /app/client/package.json ./client/package.json
COPY tsconfig.json ./

# Copy source code
COPY shared ./shared
COPY server ./server

# Generate Prisma Client
RUN cd server && npx prisma generate

# Build shared package first, then server
RUN npm run build --workspace=shared
RUN npm run build --workspace=server

# Stage 3: Production runner
FROM base AS runner
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 rewritebot

# Copy dependencies and built code
COPY --from=builder --chown=rewritebot:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=rewritebot:nodejs /app/package.json ./package.json
COPY --from=builder --chown=rewritebot:nodejs /app/shared ./shared
COPY --from=builder --chown=rewritebot:nodejs /app/server/package.json ./server/package.json
COPY --from=builder --chown=rewritebot:nodejs /app/server/dist ./server/dist
COPY --from=builder --chown=rewritebot:nodejs /app/server/prisma ./server/prisma

# Create uploads directory
RUN mkdir -p /app/uploads && chown -R rewritebot:nodejs /app/uploads

USER rewritebot

EXPOSE 3000

WORKDIR /app/server

# Run migrations and start server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
