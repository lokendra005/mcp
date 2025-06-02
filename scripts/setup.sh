#!/bin/bash

echo "🚀 MCP Multi-API Server Setup Script"
echo "===================================="

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Error: Node.js 18+ required. Current version: $(node -v)"
    exit 1
fi
echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy environment file
if [ ! -f .env ]; then
    echo "📄 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit .env and add your API keys!"
else
    echo "✅ .env file already exists"
fi

# Build the project
echo "🔨 Building project..."
npm run build

# Create logs directory
mkdir -p logs

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env and add your API keys:"
echo "   - OPENWEATHER_API_KEY"
echo "   - ALPHA_VANTAGE_API_KEY"
echo "   - NEWS_API_KEY"
echo ""
echo "2. Start the server:"
echo "   npm start"
echo ""
echo "3. Configure Claude Desktop (see README.md)"
echo ""
echo "Happy coding! 🎉"