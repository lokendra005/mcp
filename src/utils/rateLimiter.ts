import { logger } from './logger.js';

interface RateLimitConfig {
  requests: number;
  window: number; // in milliseconds
}

class RateLimiter {
  private limits: Map<string, RateLimitConfig>;
  private requests: Map<string, { count: number; resetTime: number }>;

  constructor() {
    this.limits = new Map();
    this.requests = new Map();

    // Default limits
    const defaultRequests = parseInt(process.env.RATE_LIMIT_REQUESTS || '100');
    const defaultWindow = parseInt(process.env.RATE_LIMIT_WINDOW || '60000');

    this.limits.set('weather', { requests: defaultRequests, window: defaultWindow });
    this.limits.set('finance', { requests: 5, window: 60000 }); // Alpha Vantage has strict limits
    this.limits.set('news', { requests: defaultRequests, window: defaultWindow });
  }

  async checkLimit(api: string): Promise<void> {
    const limit = this.limits.get(api);
    if (!limit) {
      logger.warn(`No rate limit configured for ${api}`);
      return;
    }

    const now = Date.now();
    const requestData = this.requests.get(api) || { count: 0, resetTime: now + limit.window };

    // Reset if window has passed
    if (now > requestData.resetTime) {
      requestData.count = 0;
      requestData.resetTime = now + limit.window;
    }

    // Check if limit exceeded
    if (requestData.count >= limit.requests) {
      const waitTime = requestData.resetTime - now;
      logger.warn(`Rate limit exceeded for ${api}. Wait ${waitTime}ms`);
      throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`);
    }

    // Increment count
    requestData.count++;
    this.requests.set(api, requestData);
    
    logger.debug(`Rate limit for ${api}: ${requestData.count}/${limit.requests}`);
  }

  getRemainingRequests(api: string): number {
    const limit = this.limits.get(api);
    const requestData = this.requests.get(api);
    
    if (!limit || !requestData) {
      return -1;
    }

    const now = Date.now();
    if (now > requestData.resetTime) {
      return limit.requests;
    }

    return Math.max(0, limit.requests - requestData.count);
  }

  reset(api?: string): void {
    if (api) {
      this.requests.delete(api);
      logger.info(`Rate limit reset for ${api}`);
    } else {
      this.requests.clear();
      logger.info('All rate limits reset');
    }
  }
}

export const rateLimiter = new RateLimiter();