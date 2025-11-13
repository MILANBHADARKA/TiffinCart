import { LRUCache } from 'lru-cache';

export default function rateLimit(options) {
  const tokenCache = new LRUCache({
    max: options.uniqueTokenPerInterval || 500,
    ttl: options.interval || 60000,
  });

  return {
    check: (limit, token) =>
      new Promise((resolve, reject) => {
        const tokenCount = tokenCache.get(token) || 0;
        
        if (tokenCount >= limit) {
          reject();
        } else {
          tokenCache.set(token, tokenCount + 1);
          resolve();
        }
      }),
  };
}
