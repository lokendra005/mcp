#!/usr/bin/env node
/**
 * HTTP Server wrapper for MCP Multi-API Server
 * Allows global deployment and HTTP-based testing
 */

import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { MCPServer } from './server.js';
import { setupWeatherTools } from './tools/weatherTools.js';
import { setupFinanceTools } from './tools/financeTools.js';
import { setupNewsTools } from './tools/newsTools.js';
import { logger } from './utils/logger.js';
import { cache } from './utils/cache.js';
import { rateLimiter } from './utils/rateLimiter.js';
import cors from 'cors';

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Initialize MCP server
const mcpServer = new MCPServer();
setupWeatherTools(mcpServer);
setupFinanceTools(mcpServer);
setupNewsTools(mcpServer);

logger.info('HTTP wrapper initialized with all tools');

// Serve static files from public directory
app.use(express.static('public'));

// Root route - serve test interface
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>MCP Multi-API Server</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .container { max-width: 800px; margin: 0 auto; }
            .status { padding: 20px; background: #e8f5e9; border-radius: 8px; margin-bottom: 20px; }
            .endpoint { background: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 4px; }
            code { background: #e0e0e0; padding: 2px 4px; border-radius: 3px; }
            pre { background: #f5f5f5; padding: 15px; border-radius: 4px; overflow-x: auto; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🌐 MCP Multi-API Server</h1>
            <div class="status">
                <h2>✅ Server is running!</h2>
                <p>This server provides weather, finance, and news data through the Model Context Protocol.</p>
            </div>
            
            <h2>Available Endpoints</h2>
            
            <div class="endpoint">
                <h3>GET /health</h3>
                <p>Health check endpoint</p>
            </div>
            
            <div class="endpoint">
                <h3>POST /mcp</h3>
                <p>Main MCP endpoint for tool interactions</p>
            </div>
            
            <div class="endpoint">
                <h3>GET /metrics</h3>
                <p>Server metrics and statistics</p>
            </div>
            
            <div class="endpoint">
                <h3>GET /tools</h3>
                <p>List all available tools</p>
            </div>
            
            <h2>Example Request</h2>
            <pre>
curl -X POST ${req.protocol}://${req.get('host')}/mcp \\
  -H "Content-Type: application/json" \\
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/list",
    "id": 1
  }'
            </pre>
            
            <h2>Test Interface</h2>
            <p><a href="/test">Open Interactive Test Interface →</a></p>
        </div>
    </body>
    </html>
  `);
});

// Health check endpoint
app.get('/health', async (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  res.json({
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cacheStats: cache.getStats(),
    rateLimits: {
      weather: rateLimiter.getRemainingRequests('weather'),
      finance: rateLimiter.getRemainingRequests('finance'),
      news: rateLimiter.getRemainingRequests('news')
    },
    timestamp: new Date().toISOString()
  });
});

interface Tool {
  name: string;
  description: string;
  inputSchema: {
    required?: string[];
  };
}

// List tools endpoint (convenience)
app.get('/tools', async (req, res) => {
  const tools = Array.from((mcpServer as any).tools.values()) as Tool[];
  res.json({
    count: tools.length,
    tools: tools.map(tool => ({
      name: tool.name,
      description: tool.description,
      requiredParams: tool.inputSchema.required || []
    }))
  });
});

// Main MCP endpoint
app.post('/mcp', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { method, params, id } = req.body;
    
    if (!method) {
      throw new Error('Missing required field: method');
    }
    
    logger.info(`MCP Request: ${method}`, { params });
    
    let result;
    
    switch (method) {
      case 'tools/list':
        result = {
          tools: Array.from((mcpServer as any).tools.values())
        };
        break;
        
      case 'tools/call':
        if (!params?.name) {
          throw new Error('Missing tool name');
        }
        
        const handler = (mcpServer as any).handlers.get(params.name);
        if (!handler) {
          throw new Error(`Unknown tool: ${params.name}`);
        }
        
        const toolResult = await handler(params.arguments || {});
        result = {
          content: [{
            type: 'text',
            text: typeof toolResult === 'string' 
              ? toolResult 
              : JSON.stringify(toolResult, null, 2)
          }]
        };
        break;
        
      default:
        throw new Error(`Unknown method: ${method}`);
    }
    
    const response = {
      jsonrpc: '2.0',
      result,
      id: id || null
    };
    
    const duration = Date.now() - startTime;
    logger.info(`MCP Response: ${method} completed in ${duration}ms`);
    
    res.json(response);
  } catch (error: any) {
    logger.error('MCP Error:', error);
    
    res.json({
      jsonrpc: '2.0',
      error: {
        code: -32603,
        message: error.message,
        data: {
          timestamp: new Date().toISOString()
        }
      },
      id: req.body.id || null
    });
  }
});

// Test interface
app.get('/test', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>MCP Server Test Interface</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
            .container { max-width: 1000px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
            .section { margin: 20px 0; padding: 20px; background: #f8f9fa; border-radius: 8px; }
            button { background: #007bff; color: white; border: none; padding: 10px 20px; margin: 5px; cursor: pointer; border-radius: 5px; font-size: 14px; }
            button:hover { background: #0056b3; }
            select, input, textarea { padding: 8px; margin: 5px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; }
            textarea { width: 100%; max-width: 500px; }
            #response { background: #e8f5e9; padding: 20px; border-radius: 8px; margin-top: 20px; white-space: pre-wrap; font-family: monospace; font-size: 12px; max-height: 500px; overflow-y: auto; }
            .error { background: #ffebee; color: #c62828; }
            .tool-section { display: inline-block; vertical-align: top; margin: 10px; }
            .status { display: inline-block; padding: 5px 10px; border-radius: 3px; font-size: 12px; }
            .status.success { background: #4caf50; color: white; }
            .status.error { background: #f44336; color: white; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🧪 MCP Multi-API Server Test Interface</h1>
            
            <div class="section">
                <h2>🔧 Quick Actions</h2>
                <button onclick="listTools()">📋 List All Tools</button>
                <button onclick="checkHealth()">🏥 Health Check</button>
                <button onclick="getMetrics()">📊 Server Metrics</button>
            </div>

            <div class="section">
                <h2>🌤️ Weather Tools</h2>
                <div class="tool-section">
                    <h3>Current Weather</h3>
                    <input type="text" id="weather-city" placeholder="City name" value="London">
                    <button onclick="getCurrentWeather()">Get Weather</button>
                </div>
                
                <div class="tool-section">
                    <h3>Weather Forecast</h3>
                    <input type="text" id="forecast-city" placeholder="City name" value="Paris">
                    <input type="number" id="forecast-days" placeholder="Days" value="3" min="1" max="5">
                    <button onclick="getWeatherForecast()">Get Forecast</button>
                </div>
            </div>

            <div class="section">
                <h2>💰 Finance Tools</h2>
                <div class="tool-section">
                    <h3>Stock Quote</h3>
                    <input type="text" id="stock-symbol" placeholder="Symbol" value="AAPL">
                    <button onclick="getStockQuote()">Get Quote</button>
                </div>
                
                <div class="tool-section">
                    <h3>Currency Exchange</h3>
                    <input type="text" id="currency-from" placeholder="From" value="USD" size="5">
                    <input type="text" id="currency-to" placeholder="To" value="EUR" size="5">
                    <button onclick="getCurrencyExchange()">Get Rate</button>
                </div>
                
                <div class="tool-section">
                    <h3>Crypto Price</h3>
                    <input type="text" id="crypto-symbol" placeholder="Symbol" value="BTC">
                    <button onclick="getCryptoPrice()">Get Price</button>
                </div>
            </div>

            <div class="section">
                <h2>📰 News Tools</h2>
                <div class="tool-section">
                    <h3>Top Headlines</h3>
                    <select id="news-country">
                        <option value="us">United States</option>
                        <option value="gb">United Kingdom</option>
                        <option value="de">Germany</option>
                        <option value="fr">France</option>
                    </select>
                    <select id="news-category">
                        <option value="">All</option>
                        <option value="business">Business</option>
                        <option value="technology">Technology</option>
                        <option value="science">Science</option>
                        <option value="health">Health</option>
                        <option value="sports">Sports</option>
                    </select>
                    <button onclick="getTopHeadlines()">Get Headlines</button>
                </div>
                
                <div class="tool-section">
                    <h3>Search News</h3>
                    <input type="text" id="news-query" placeholder="Search query" value="artificial intelligence">
                    <button onclick="searchNews()">Search</button>
                </div>
            </div>

            <div class="section">
                <h2>🛠️ Custom Tool Call</h2>
                <select id="custom-tool">
                    <option value="get_current_weather">get_current_weather</option>
                    <option value="get_weather_forecast">get_weather_forecast</option>
                    <option value="get_stock_quote">get_stock_quote</option>
                    <option value="get_currency_exchange">get_currency_exchange</option>
                    <option value="get_crypto_price">get_crypto_price</option>
                    <option value="get_top_headlines">get_top_headlines</option>
                    <option value="search_news">search_news</option>
                    <option value="get_news_sources">get_news_sources</option>
                </select>
                <br>
                <textarea id="custom-args" placeholder='{"city": "London"}' rows="3"></textarea>
                <br>
                <button onclick="callCustomTool()">Call Tool</button>
            </div>

            <div id="response"></div>
        </div>

        <script>
            const API_URL = '/mcp';
            let requestId = 1;
            
            async function makeRequest(method, params = {}) {
                const startTime = Date.now();
                const responseDiv = document.getElementById('response');
                
                try {
                    const response = await fetch(API_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            jsonrpc: '2.0',
                            method,
                            params,
                            id: requestId++
                        })
                    });
                    
                    const data = await response.json();
                    const duration = Date.now() - startTime;
                    
                    responseDiv.className = data.error ? 'error' : '';
                    responseDiv.textContent = JSON.stringify(data, null, 2) + '\\n\\nResponse time: ' + duration + 'ms';
                    
                    return data;
                } catch (error) {
                    responseDiv.className = 'error';
                    responseDiv.textContent = 'Error: ' + error.message;
                }
            }
            
            async function checkHealth() {
                const response = await fetch('/health');
                const data = await response.json();
                document.getElementById('response').textContent = JSON.stringify(data, null, 2);
            }
            
            async function getMetrics() {
                const response = await fetch('/metrics');
                const data = await response.json();
                document.getElementById('response').textContent = JSON.stringify(data, null, 2);
            }
            
            function listTools() {
                makeRequest('tools/list');
            }
            
            function getCurrentWeather() {
                makeRequest('tools/call', {
                    name: 'get_current_weather',
                    arguments: { city: document.getElementById('weather-city').value }
                });
            }
            
            function getWeatherForecast() {
                makeRequest('tools/call', {
                    name: 'get_weather_forecast',
                    arguments: {
                        city: document.getElementById('forecast-city').value,
                        days: parseInt(document.getElementById('forecast-days').value)
                    }
                });
            }
            
            function getStockQuote() {
                makeRequest('tools/call', {
                    name: 'get_stock_quote',
                    arguments: { symbol: document.getElementById('stock-symbol').value }
                });
            }
            
            function getCurrencyExchange() {
                makeRequest('tools/call', {
                    name: 'get_currency_exchange',
                    arguments: {
                        from: document.getElementById('currency-from').value,
                        to: document.getElementById('currency-to').value
                    }
                });
            }
            
            function getCryptoPrice() {
                makeRequest('tools/call', {
                    name: 'get_crypto_price',
                    arguments: { symbol: document.getElementById('crypto-symbol').value }
                });
            }
            
            function getTopHeadlines() {
                const args = {
                    country: document.getElementById('news-country').value
                };
                const category = document.getElementById('news-category').value;
                if (category) args.category = category;
                
                makeRequest('tools/call', {
                    name: 'get_top_headlines',
                    arguments: args
                });
            }
            
            function searchNews() {
                makeRequest('tools/call', {
                    name: 'search_news',
                    arguments: { query: document.getElementById('news-query').value }
                });
            }
            
            function callCustomTool() {
                const toolName = document.getElementById('custom-tool').value;
                const args = JSON.parse(document.getElementById('custom-args').value || '{}');
                
                makeRequest('tools/call', {
                    name: toolName,
                    arguments: args
                });
            }
            
            // Load initial data
            checkHealth();
        </script>
    </body>
    </html>
  `);
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Required for cloud deployments

app.listen(parseInt(PORT.toString()), HOST, () => {
  logger.info(`HTTP server running on ${HOST}:${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Test interface available at http://localhost:${PORT}/test`);
});

// Export the Express app as default
export default app;