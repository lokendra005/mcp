import { MCPServer } from '../server.js';
import { getCurrentWeather, getWeatherForecast } from '../api/weather.js';
import { logger } from '../utils/logger.js';

export function setupWeatherTools(mcpServer: MCPServer) {
  // Register weather tools
  mcpServer.registerTool(
    {
      name: 'get_current_weather',
      description: 'Get current weather for a city',
      inputSchema: {
        type: 'object',
        properties: {
          city: {
            type: 'string',
            description: 'City name (e.g., "London", "New York")'
          }
        },
        required: ['city']
      }
    },
    async (args) => {
      const { city } = args as { city: string };
      logger.info(`Getting current weather for ${city}`);
      return await getCurrentWeather(city);
    }
  );

  mcpServer.registerTool(
    {
      name: 'get_weather_forecast',
      description: 'Get weather forecast for a city',
      inputSchema: {
        type: 'object',
        properties: {
          city: {
            type: 'string',
            description: 'City name (e.g., "London", "New York")'
          },
          days: {
            type: 'number',
            description: 'Number of days to forecast (1-5)',
            minimum: 1,
            maximum: 5,
            default: 5
          }
        },
        required: ['city']
      }
    },
    async (args) => {
      const { city, days = 5 } = args as { city: string; days?: number };
      logger.info(`Getting weather forecast for ${city} (${days} days)`);
      return await getWeatherForecast(city, days);
    }
  );
}