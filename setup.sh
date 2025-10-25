#!/bin/bash

# Colla - Setup Script
# Ce script installe toutes les dépendances et prépare l'environnement

set -e

echo "🚀 Colla - Installation"
echo "======================"
echo ""

# Check Node version
echo "📦 Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ Error: Node.js version 18 or higher required"
  echo "   Current version: $(node -v)"
  exit 1
fi
echo "✅ Node.js $(node -v)"

# Check npm version
NPM_VERSION=$(npm -v | cut -d'.' -f1)
if [ "$NPM_VERSION" -lt 9 ]; then
  echo "❌ Error: npm version 9 or higher required"
  echo "   Current version: $(npm -v)"
  exit 1
fi
echo "✅ npm $(npm -v)"
echo ""

# Install dependencies
echo "📥 Installing dependencies..."
npm install
echo ""

echo "✅ Dependencies installed!"
echo "� Package @colla/shared built automatically via postinstall"
echo ""

# Create .env files
echo "⚙️  Creating environment files..."

if [ ! -f "packages/server/.env" ]; then
  cp packages/server/.env.example packages/server/.env
  echo "✅ Created packages/server/.env"
else
  echo "⏭️  packages/server/.env already exists"
fi
echo ""

# Run tests
echo "🧪 Running tests..."
npm test -w @colla/shared
echo ""

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Start the backend:  npm run dev:server"
echo "  2. Start the web app:  npm run dev:web"
echo "  3. Start desktop app:  npm run dev:desktop"
echo ""
echo "Documentation:"
echo "  - README.md         - Project overview"
echo "  - ARCHITECTURE.md   - Architecture decisions"
echo "  - DEVELOPMENT.md    - Development guide"
echo ""
echo "Happy coding! 🚀"
