#!/bin/bash
# WebowoROS — Development Setup Script
# Run this after cloning the repository

set -e

echo "🍕 WebowoROS Development Setup"
echo "==============================="

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js 20+ required. Found: $(node -v)"
    exit 1
fi
echo "✅ Node.js $(node -v)"

# Check npm version
NPM_VERSION=$(npm -v | cut -d'.' -f1)
if [ "$NPM_VERSION" -lt 10 ]; then
    echo "❌ npm 10+ required. Found: $(npm -v)"
    exit 1
fi
echo "✅ npm $(npm -v)"

# Check Docker
if command -v docker &> /dev/null; then
    echo "✅ Docker $(docker -v)"
else
    echo "⚠️ Docker not found. Install Docker for full development."
fi

# Copy environment file
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env from .env.example"
    echo "⚠️  IMPORTANT: Edit .env and set your secrets!"
else
    echo "✅ .env already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔄 Generating Prisma client..."
npm run db:generate

# Run database migrations
echo "🗄 Running database migrations..."
npm run db:migrate

# Seed database
echo "🌱 Seeding database..."
npm run db:seed

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Edit .env and configure your secrets"
echo "  2. Start development: npm run dev"
echo "  3. Open http://localhost:3000 (web)"
echo "  4. Open http://localhost:3001 (dashboard)"
echo "  5. API runs on http://localhost:4000"
