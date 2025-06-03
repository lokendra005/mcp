#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import dotenv from 'dotenv';
import { MCPServer } from './server.js';
import { setupWeatherTools } from './tools/weatherTools.js';
import { setupFinanceTools } from './tools/financeTools.js';
import { setupNewsTools } from './tools/newsTools.js';
import { logger } from './utils/logger.js';

// Load environment variables
dotenv.config();

async function main() {
  logger.info('Starting MCP Multi-API Server...');

  // Check for required API keys
  const requiredKeys = ['OPENWEATHER_API_KEY', 'ALPHA_VANTAGE_API_KEY', 'NEWS_API_KEY'];
  const missingKeys = requiredKeys.filter(key => !process.env[key]);
  
  if (missingKeys.length > 0) {
    logger.warn(`Missing API keys: ${missingKeys.join(', ')}`);
    logger.warn('Some functionality may be limited');
  }

  // Create MCP server instance
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
  logger.info('Ready to accept connections from Claude');
}

main().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});