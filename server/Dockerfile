FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy all package files
COPY package.json package-lock.json* ./
COPY shared/package.json ./shared/
COPY server/package.json ./server/

# Install shared dependencies
WORKDIR /app/shared
RUN npm install

# Install server dependencies
WORKDIR /app/server
RUN npm install

WORKDIR /app

# Build stage
FROM base AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/shared/node_modules ./shared/node_modules
COPY --from=deps /app/server/node_modules ./server/node_modules

# Copy source files
COPY shared ./shared
COPY server ./server
COPY tsconfig.json ./

# Generate Prisma Client
RUN cd server && npx prisma generate

# Build shared and server
RUN cd shared && npm run build && cd ../server && npm run build

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 rewritebot

# Copy built files
COPY --from=builder --chown=rewritebot:nodejs /app/server/dist ./server/dist
COPY --from=builder --chown=rewritebot:nodejs /app/server/node_modules ./server/node_modules
COPY --from=builder --chown=rewritebot:nodejs /app/server/prisma ./server/prisma
COPY --from=builder --chown=rewritebot:nodejs /app/shared/dist ./shared/dist
COPY --from=builder --chown=rewritebot:nodejs /app/shared/node_modules ./shared/node_modules

# Create uploads directory
RUN mkdir -p /app/uploads && chown rewritebot:nodejs /app/uploads

USER rewritebot

EXPOSE 3000

WORKDIR /app/server

# Run migrations and start server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
