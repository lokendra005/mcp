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
