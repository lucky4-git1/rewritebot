FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy all package files
COPY package.json package-lock.json* ./
COPY shared/package.json ./shared/
COPY client/package.json ./client/

# Install shared dependencies
WORKDIR /app/shared
RUN npm install

# Install client dependencies
WORKDIR /app/client
RUN npm install

WORKDIR /app

# Build stage
FROM base AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/shared/node_modules ./shared/node_modules
COPY --from=deps /app/client/node_modules ./client/node_modules

# Copy source files
COPY shared ./shared
COPY client ./client
COPY tsconfig.json ./

# Build shared and client
RUN npm run build --workspace=shared
RUN npm run build --workspace=client

# Production stage with nginx
FROM nginx:alpine AS runner

# Copy built files
COPY --from=builder /app/client/dist /usr/share/nginx/html

# Copy nginx configuration
COPY client/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
