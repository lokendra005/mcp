#!/bin/bash

echo "🚂 Railway Deployment Fix Script"
echo "================================"

# Ensure all required files exist
echo "📝 Creating required files..."

# Create railway.toml
cat > railway.toml << 'EOF'
[build]
builder = "nixpacks"
buildCommand = "npm install && npm run build:http"

[deploy]
startCommand = "npm run start:http"
healthcheckPath = "/health"
healthcheckTimeout = 100
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 3

[[services]]
protocol = "tcp"
port = 3000
EOF

# Create Procfile
echo "web: npm run start:http" > Procfile

# Create nixpacks.toml
cat > nixpacks.toml << 'EOF'
[phases.setup]
nixPkgs = ["nodejs-18_x", "npm-9_x"]

[phases.install]
cmds = ["npm install"]

[phases.build]
cmds = ["npm run build:http"]

[start]
cmd = "npm run start:http"
EOF

# Update package.json to ensure dependencies are correct
echo "📦 Checking dependencies..."

# Check if package.json has required dependencies
if ! grep -q '"cors"' package.json; then
    echo "⚠️  Missing cors dependency. Please run:"
    echo "npm install cors"
fi

if ! grep -q '"@types/express"' package.json; then
    echo "⚠️  Missing @types/express. Please run:"
    echo "npm install --save-dev @types/express @types/cors"
fi

echo ""
echo "✅ Files created successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Install missing dependencies:"
echo "   npm install cors"
echo "   npm install --save-dev @types/express @types/cors"
echo ""
echo "2. Commit and push changes:"
echo "   git add ."
echo "   git commit -m 'Fix Railway deployment configuration'"
echo "   git push"
echo ""
echo "3. Deploy to Railway:"
echo "   railway up"
echo ""
echo "4. Set environment variables in Railway dashboard:"
echo "   - OPENWEATHER_API_KEY"
echo "   - ALPHA_VANTAGE_API_KEY"
echo "   - NEWS_API_KEY"
echo ""
echo "🎉 Your server should deploy successfully after these steps!"
