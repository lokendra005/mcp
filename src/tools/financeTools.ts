import { MCPServer } from '../server.js';
import { getStockQuote, getCurrencyExchange, getCryptoPrice } from '../api/finance.js';
import { logger } from '../utils/logger.js';

export function setupFinanceTools(mcpServer: MCPServer) {
  // Register finance tools
  mcpServer.registerTool(
    {
      name: 'get_stock_quote',
      description: 'Get real-time stock quote',
      inputSchema: {
        type: 'object',
        properties: {
          symbol: {
            type: 'string',
            description: 'Stock symbol (e.g., "AAPL", "GOOGL")'
          }
        },
        required: ['symbol']
      }
    },
    async (args) => {
      const { symbol } = args as { symbol: string };
      logger.info(`Getting stock quote for ${symbol}`);
      return await getStockQuote(symbol);
    }
  );

  mcpServer.registerTool(
    {
      name: 'get_currency_exchange',
      description: 'Get currency exchange rate',
      inputSchema: {
        type: 'object',
        properties: {
          from: {
            type: 'string',
            description: 'From currency code (e.g., "USD", "EUR")'
          },
          to: {
            type: 'string',
            description: 'To currency code (e.g., "EUR", "GBP")'
          }
        },
        required: ['from', 'to']
      }
    },
    async (args) => {
      const { from, to } = args as { from: string; to: string };
      logger.info(`Getting exchange rate for ${from}/${to}`);
      return await getCurrencyExchange(from, to);
    }
  );

  mcpServer.registerTool(
    {
      name: 'get_crypto_price',
      description: 'Get cryptocurrency price in USD',
      inputSchema: {
        type: 'object',
        properties: {
          symbol: {
            type: 'string',
            description: 'Cryptocurrency symbol (e.g., "BTC", "ETH")'
          }
        },
        required: ['symbol']
      }
    },
    async (args) => {
      const { symbol } = args as { symbol: string };
      logger.info(`Getting crypto price for ${symbol}`);
      return await getCryptoPrice(symbol);
    }
  );
}