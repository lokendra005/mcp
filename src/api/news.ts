import axios from 'axios';
import { cache } from '../utils/cache.js';
import { rateLimiter } from '../utils/rateLimiter.js';
import { logger } from '../utils/logger.js';

const NEWS_API_BASE_URL = 'https://newsapi.org/v2';
const API_KEY = process.env.NEWS_API_KEY;

export async function getTopHeadlines(country: string = 'us', category?: string): Promise<any> {
  const cacheKey = `news:headlines:${country}:${category || 'all'}`;
  const cached = cache.get(cacheKey);
  
  if (cached) {
    logger.info(`Returning cached headlines for ${country}/${category}`);
    return cached;
  }

  await rateLimiter.checkLimit('news');

  try {
    const params: any = {
      country,
      apiKey: API_KEY,
      pageSize: 10
    };

    if (category) {
      params.category = category;
    }

    const response = await axios.get(`${NEWS_API_BASE_URL}/top-headlines`, { params });

    const data = {
      country,
      category: category || 'all',
      total_results: response.data.totalResults,
      articles: response.data.articles.map((article: any) => ({
        title: article.title,
        description: article.description,
        source: article.source.name,
        author: article.author,
        url: article.url,
        published_at: article.publishedAt,
        image_url: article.urlToImage
      })),
      timestamp: new Date().toISOString()
    };

    cache.set(cacheKey, data, parseInt(process.env.CACHE_TTL_NEWS || '600'));
    logger.info(`Fetched headlines for ${country}/${category}`);
    
    return data;
  } catch (error: any) {
    logger.error(`Error fetching headlines:`, error.message);
    throw new Error(`Failed to fetch headlines: ${error.message}`);
  }
}

export async function searchNews(query: string, sortBy: string = 'relevancy'): Promise<any> {
  const cacheKey = `news:search:${query}:${sortBy}`;
  const cached = cache.get(cacheKey);
  
  if (cached) {
    logger.info(`Returning cached news search for ${query}`);
    return cached;
  }

  await rateLimiter.checkLimit('news');

  try {
    const response = await axios.get(`${NEWS_API_BASE_URL}/everything`, {
      params: {
        q: query,
        sortBy,
        language: 'en',
        pageSize: 10,
        apiKey: API_KEY
      }
    });

    const data = {
      query,
      sort_by: sortBy,
      total_results: response.data.totalResults,
      articles: response.data.articles.map((article: any) => ({
        title: article.title,
        description: article.description,
        source: article.source.name,
        author: article.author,
        url: article.url,
        published_at: article.publishedAt,
        image_url: article.urlToImage
      })),
      timestamp: new Date().toISOString()
    };

    cache.set(cacheKey, data, parseInt(process.env.CACHE_TTL_NEWS || '600'));
    logger.info(`Fetched news search for ${query}`);
    
    return data;
  } catch (error: any) {
    logger.error(`Error searching news:`, error.message);
    throw new Error(`Failed to search news: ${error.message}`);
  }
}

export async function getNewsSources(category?: string, country?: string): Promise<any> {
  const cacheKey = `news:sources:${category || 'all'}:${country || 'all'}`;
  const cached = cache.get(cacheKey);
  
  if (cached) {
    logger.info(`Returning cached news sources`);
    return cached;
  }

  await rateLimiter.checkLimit('news');

  try {
    const params: any = { apiKey: API_KEY };
    if (category) params.category = category;
    if (country) params.country = country;

    const response = await axios.get(`${NEWS_API_BASE_URL}/sources`, { params });

    const data = {
      category: category || 'all',
      country: country || 'all',
      sources: response.data.sources.map((source: any) => ({
        id: source.id,
        name: source.name,
        description: source.description,
        url: source.url,
        category: source.category,
        language: source.language,
        country: source.country
      })),
      timestamp: new Date().toISOString()
    };

    cache.set(cacheKey, data, parseInt(process.env.CACHE_TTL_NEWS || '600'));
    logger.info(`Fetched news sources`);
    
    return data;
  } catch (error: any) {
    logger.error(`Error fetching news sources:`, error.message);
    throw new Error(`Failed to fetch news sources: ${error.message}`);
  }
}