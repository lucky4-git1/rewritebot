#!/bin/bash

# RewriteBot Database Initialization Script

set -e

echo "🗄️  Initializing RewriteBot Database..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ Error: DATABASE_URL environment variable is not set"
  echo "   Please set it in your .env file or export it"
  exit 1
fi

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate

# Run migrations
echo "🔄 Running database migrations..."
npx prisma migrate dev --name init

# Seed database
echo "🌱 Seeding database with initial data..."
npx tsx prisma/seed.ts

echo "✅ Database initialization complete!"
echo ""
echo "Demo credentials:"
echo "  Email: demo@rewritebot.com"
echo "  Password: demo123456"
