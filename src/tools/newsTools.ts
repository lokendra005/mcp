import { MCPServer } from '../server.js';
import { getTopHeadlines, searchNews, getNewsSources } from '../api/news.js';
import { logger } from '../utils/logger.js';

export function setupNewsTools(mcpServer: MCPServer) {
  // Register news tools
  mcpServer.registerTool(
    {
      name: 'get_top_headlines',
      description: 'Get top news headlines',
      inputSchema: {
        type: 'object',
        properties: {
          country: {
            type: 'string',
            description: 'Country code (e.g., "us", "gb", "de")',
            default: 'us'
          },
          category: {
            type: 'string',
            description: 'News category',
            enum: ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology']
          }
        }
      }
    },
    async (args) => {
      const { country = 'us', category } = args as { country?: string; category?: string };
      logger.info(`Getting top headlines for ${country}/${category || 'all'}`);
      return await getTopHeadlines(country, category);
    }
  );

  mcpServer.registerTool(
    {
      name: 'search_news',
      description: 'Search news articles',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query'
          },
          sortBy: {
            type: 'string',
            description: 'Sort results by',
            enum: ['relevancy', 'popularity', 'publishedAt'],
            default: 'relevancy'
          }
        },
        required: ['query']
      }
    },
    async (args) => {
      const { query, sortBy = 'relevancy' } = args as { query: string; sortBy?: string };
      logger.info(`Searching news for: ${query}`);
      return await searchNews(query, sortBy);
    }
  );

  mcpServer.registerTool(
    {
      name: 'get_news_sources',
      description: 'Get available news sources',
      inputSchema: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            description: 'Filter by category',
            enum: ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology']
          },
          country: {
            type: 'string',
            description: 'Filter by country code (e.g., "us", "gb")'
          }
        }
      }
    },
    async (args) => {
      const { category, country } = args as { category?: string; country?: string };
      logger.info(`Getting news sources`);
      return await getNewsSources(category, country);
    }
  );
}