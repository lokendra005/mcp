import axios from 'axios';
import { cache } from '../utils/cache.js';
import { rateLimiter } from '../utils/rateLimiter.js';
import { logger } from '../utils/logger.js';

const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';
const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

export async function getStockQuote(symbol: string): Promise<any> {
  const cacheKey = `finance:quote:${symbol}`;
  const cached = cache.get(cacheKey);
  
  if (cached) {
    logger.info(`Returning cached quote for ${symbol}`);
    return cached;
  }

  await rateLimiter.checkLimit('finance');

  try {
    const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol: symbol,
        apikey: API_KEY
      }
    });

    if (!response.data['Global Quote']) {
      throw new Error('Invalid symbol or API limit reached');
    }

    const quote = response.data['Global Quote'];
    const data = {
      symbol: quote['01. symbol'],
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      change_percent: quote['10. change percent'],
      volume: parseInt(quote['06. volume']),
      latest_trading_day: quote['07. latest trading day'],
      previous_close: parseFloat(quote['08. previous close']),
      timestamp: new Date().toISOString()
    };

    cache.set(cacheKey, data, parseInt(process.env.CACHE_TTL_FINANCE || '60'));
    logger.info(`Fetched quote for ${symbol}`);
    
    return data;
  } catch (error: any) {
    logger.error(`Error fetching quote for ${symbol}:`, error.message);
    throw new Error(`Failed to fetch stock quote: ${error.message}`);
  }
}

export async function getCurrencyExchange(from: string, to: string): Promise<any> {
  const cacheKey = `finance:exchange:${from}:${to}`;
  const cached = cache.get(cacheKey);
  
  if (cached) {
    logger.info(`Returning cached exchange rate for ${from}/${to}`);
    return cached;
  }

  await rateLimiter.checkLimit('finance');

  try {
    const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
      params: {
        function: 'CURRENCY_EXCHANGE_RATE',
        from_currency: from,
        to_currency: to,
        apikey: API_KEY
      }
    });

    if (!response.data['Realtime Currency Exchange Rate']) {
      throw new Error('Invalid currency codes or API limit reached');
    }

    const exchange = response.data['Realtime Currency Exchange Rate'];
    const data = {
      from_currency: exchange['1. From_Currency Code'],
      from_currency_name: exchange['2. From_Currency Name'],
      to_currency: exchange['3. To_Currency Code'],
      to_currency_name: exchange['4. To_Currency Name'],
      exchange_rate: parseFloat(exchange['5. Exchange Rate']),
      last_refreshed: exchange['6. Last Refreshed'],
      timezone: exchange['7. Time Zone'],
      timestamp: new Date().toISOString()
    };

    cache.set(cacheKey, data, parseInt(process.env.CACHE_TTL_FINANCE || '60'));
    logger.info(`Fetched exchange rate for ${from}/${to}`);
    
    return data;
  } catch (error: any) {
    logger.error(`Error fetching exchange rate for ${from}/${to}:`, error.message);
    throw new Error(`Failed to fetch exchange rate: ${error.message}`);
  }
}

export async function getCryptoPrice(symbol: string): Promise<any> {
  const cacheKey = `finance:crypto:${symbol}`;
  const cached = cache.get(cacheKey);
  
  if (cached) {
    logger.info(`Returning cached crypto price for ${symbol}`);
    return cached;
  }

  await rateLimiter.checkLimit('finance');

  try {
    const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
      params: {
        function: 'CURRENCY_EXCHANGE_RATE',
        from_currency: symbol,
        to_currency: 'USD',
        apikey: API_KEY
      }
    });

    if (!response.data['Realtime Currency Exchange Rate']) {
      throw new Error('Invalid crypto symbol or API limit reached');
    }

    const exchange = response.data['Realtime Currency Exchange Rate'];
    const data = {
      symbol: exchange['1. From_Currency Code'],
      name: exchange['2. From_Currency Name'],
      price_usd: parseFloat(exchange['5. Exchange Rate']),
      last_refreshed: exchange['6. Last Refreshed'],
      timestamp: new Date().toISOString()
    };

    cache.set(cacheKey, data, parseInt(process.env.CACHE_TTL_FINANCE || '60'));
    logger.info(`Fetched crypto price for ${symbol}`);
    
    return data;
  } catch (error: any) {
    logger.error(`Error fetching crypto price for ${symbol}:`, error.message);
    throw new Error(`Failed to fetch crypto price: ${error.message}`);
  }
}