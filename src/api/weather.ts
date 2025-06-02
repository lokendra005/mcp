import axios from 'axios';
import { cache } from '../utils/cache.js';
import { rateLimiter } from '../utils/rateLimiter.js';
import { logger } from '../utils/logger.js';
import dotenv from 'dotenv';

// Force reload environment variables
dotenv.config();

const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';
const API_KEY = process.env.OPENWEATHER_API_KEY;

// Add debug logging
logger.info(`API Key loaded: ${API_KEY ? 'Yes' : 'No'}`);
if (!API_KEY) {
  logger.error('OpenWeather API key not found in environment variables');
}

interface DailyForecast {
  date: string;
  min_temp: number;
  max_temp: number;
  avg_temp: number;
  description: string;
}

export async function getCurrentWeather(city: string): Promise<any> {
  const cacheKey = `weather:current:${city}`;
  const cached = cache.get(cacheKey);
  
  if (cached) {
    logger.info(`Returning cached weather for ${city}`);
    return cached;
  }

  await rateLimiter.checkLimit('weather');

  try {
    const response = await axios.get(`${OPENWEATHER_BASE_URL}/weather`, {
      params: {
        q: city,
        appid: API_KEY,
        units: 'metric'
      }
    });

    const data = {
      city: response.data.name,
      country: response.data.sys.country,
      temperature: response.data.main.temp,
      feels_like: response.data.main.feels_like,
      description: response.data.weather[0].description,
      humidity: response.data.main.humidity,
      wind_speed: response.data.wind.speed,
      timestamp: new Date().toISOString()
    };

    cache.set(cacheKey, data, parseInt(process.env.CACHE_TTL_WEATHER || '300'));
    logger.info(`Fetched weather for ${city}`);
    
    return data;
  } catch (error: any) {
    logger.error(`Error fetching weather for ${city}:`, error.message);
    throw new Error(`Failed to fetch weather: ${error.message}`);
  }
}

export async function getWeatherForecast(city: string, days: number = 5): Promise<any> {
  const cacheKey = `weather:forecast:${city}:${days}`;
  const cached = cache.get(cacheKey);
  
  if (cached) {
    logger.info(`Returning cached forecast for ${city}`);
    return cached;
  }

  await rateLimiter.checkLimit('weather');

  try {
    const response = await axios.get(`${OPENWEATHER_BASE_URL}/forecast`, {
      params: {
        q: city,
        appid: API_KEY,
        units: 'metric',
        cnt: days * 8 // 8 forecasts per day (3-hour intervals)
      }
    });

    const dailyForecasts: DailyForecast[] = [];
    const forecastsByDay = new Map();

    response.data.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000).toDateString();
      if (!forecastsByDay.has(date)) {
        forecastsByDay.set(date, []);
      }
      forecastsByDay.get(date).push(item);
    });

    forecastsByDay.forEach((forecasts, date) => {
      const temps = forecasts.map((f: any) => f.main.temp);
      const descriptions = forecasts.map((f: any) => f.weather[0].description);
      
      dailyForecasts.push({
        date,
        min_temp: Math.min(...temps),
        max_temp: Math.max(...temps),
        avg_temp: temps.reduce((a: number, b: number) => a + b) / temps.length,
        description: descriptions[Math.floor(descriptions.length / 2)]
      });
    });

    const data = {
      city: response.data.city.name,
      country: response.data.city.country,
      forecasts: dailyForecasts.slice(0, days),
      timestamp: new Date().toISOString()
    };

    cache.set(cacheKey, data, parseInt(process.env.CACHE_TTL_WEATHER || '300'));
    logger.info(`Fetched forecast for ${city}`);
    
    return data;
  } catch (error: any) {
    logger.error(`Error fetching forecast for ${city}:`, error.message);
    throw new Error(`Failed to fetch forecast: ${error.message}`);
  }
}