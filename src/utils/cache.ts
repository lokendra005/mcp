import NodeCache from 'node-cache';
import { logger } from './logger.js';

class CacheManager {
  private cache: NodeCache;

  constructor() {
    this.cache = new NodeCache({
      stdTTL: 600, // Default 10 minutes
      checkperiod: 120, // Check for expired keys every 2 minutes
      useClones: false // For better performance
    });

    this.cache.on('expired', (key, value) => {
      logger.debug(`Cache expired: ${key}`);
    });

    this.cache.on('set', (key, value) => {
      logger.debug(`Cache set: ${key}`);
    });
  }

  set(key: string, value: any, ttl?: number): boolean {
    return this.cache.set(key, value, ttl || 0);
  }

  get<T>(key: string): T | undefined {
    return this.cache.get<T>(key);
  }

  del(key: string): number {
    return this.cache.del(key);
  }

  flush(): void {
    this.cache.flushAll();
    logger.info('Cache flushed');
  }

  getStats() {
    return this.cache.getStats();
  }
}

export const cache = new CacheManager();