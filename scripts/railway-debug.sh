#!/bin/bash

echo "🔍 Railway Deployment Debugging"
echo "=============================="
echo ""

# Step 1: Test simple server first
echo "Step 1: Testing with simple HTTP server"
echo "--------------------------------------"

# Update railway.toml to use simple server
cat > railway.toml << 'EOF'
[build]
builder = "nixpacks"
buildCommand = "npm install && npm run build"

[deploy]
startCommand = "node dist/simple-server.js"
healthcheckPath = "/health"
healthcheckTimeout = 30

[[services]]
protocol = "tcp"
port = 3000
EOF

echo "✅ Created railway.toml for simple server"

# Update Procfile
echo "web: node dist/simple-server.js" > Procfile

echo "✅ Updated Procfile"
echo ""
echo "📋 Deploy the simple server first:"
echo "1. git add ."
echo "2. git commit -m 'Test with simple server'"
echo "3. git push"
echo "4. railway up"
echo ""
echo "If simple server works, we'll proceed to fix the main server."
echo ""

read -p "Did the simple server deploy successfully? (y/n): " simple_success

if [ "$simple_success" != "y" ]; then
    echo "❌ Simple server failed. This indicates a Railway configuration issue."
    echo "Check:"
    echo "- Railway logs: railway logs"
    echo "- Environment variables are set"
    echo "- Build completes successfully"
    exit 1
fi

echo ""
echo "Step 2: Fixing main HTTP server"
echo "-------------------------------"

# Create a wrapper script that ensures proper startup
cat > src/railway-wrapper.ts << 'EOF'
#!/usr/bin/env node
/**
 * Railway-specific wrapper to ensure proper startup
 */

console.log('Railway wrapper starting...');
console.log('Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  RAILWAY_ENVIRONMENT: process.env.RAILWAY_ENVIRONMENT,
  RAILWAY_STATIC_URL: process.env.RAILWAY_STATIC_URL
});

// Ensure PORT is set
if (!process.env.PORT) {
  process.env.PORT = '3000';
  console.log('PORT not set, defaulting to 3000');
}

// Import and start the HTTP server
console.log('Starting HTTP server...');
import('./http-server.js').then(() => {
  console.log('HTTP server imported successfully');
}).catch(err => {
  console.error('Failed to start HTTP server:', err);
  process.exit(1);
});

// Keep process alive
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
EOF

echo "✅ Created railway-wrapper.ts"

# Update railway.toml for main server
cat > railway.toml << 'EOF'
[build]
builder = "nixpacks"
buildCommand = "npm install && npm install --save-dev @types/express @types/cors && npm run build"

[deploy]
startCommand = "node --max-old-space-size=512 dist/railway-wrapper.js"
healthcheckPath = "/health"
healthcheckTimeout = 30
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 5

[[services]]
protocol = "tcp"
port = 3000

[variables]
NODE_ENV = "production"
USE_HTTP_SERVER = "true"
EOF

echo "✅ Updated railway.toml for main server"

# Create a minimal test to run after build
cat > test-build.js << 'EOF'
console.log('Testing build output...');
try {
  require('./dist/http-server.js');
  console.log('✅ Build test passed');
} catch (err) {
  console.error('❌ Build test failed:', err.message);
  process.exit(1);
}
EOF

echo "✅ Created build test"
echo ""
echo "📋 Final deployment steps:"
echo "1. npm run build"
echo "2. node test-build.js"
echo "3. git add ."
echo "4. git commit -m 'Fix Railway deployment with wrapper'"
echo "5. git push"
echo "6. railway up"
echo ""
echo "Monitor logs with: railway logs -f"