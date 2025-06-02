#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import dotenv from 'dotenv';
import { setupWeatherTools } from './tools/weatherTools.js';
import { setupFinanceTools } from './tools/financeTools.js';
import { setupNewsTools } from './tools/newsTools.js';
import { logger } from './utils/logger.js';
import { MCPServer } from './server.js';

// Load environment variables before anything else
dotenv.config({ path: '.env' });

// Add this to verify
console.log('API Key:', process.env.OPENWEATHER_API_KEY);

async function main() {
  logger.info('Starting MCP Multi-API Server...');

  const mcpServer = new MCPServer();
  const server = mcpServer.getServer();

  // Setup all API tools
  setupWeatherTools(mcpServer);
  setupFinanceTools(mcpServer);
  setupNewsTools(mcpServer);

  // Error handling
  server.onerror = (error) => {
    logger.error('Server error:', error);
  };

  // Start the server
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  logger.info('MCP Multi-API Server started successfully');
}

main().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});