import { EnrichedMedia, MediaType } from '@/types/tmdb';

const CACHE_KEY_PREFIX = 'cinemator_pool_';
const CACHE_EXPIRY_HOURS = 24;

interface CacheEntry {
  data: EnrichedMedia[];
  timestamp: number;
}

export function getCachedPool(mediaType: MediaType): EnrichedMedia[] | null {
  try {
    const key = `${CACHE_KEY_PREFIX}${mediaType}`;
    const cached = localStorage.getItem(key);
    
    if (!cached) return null;
    
    const entry: CacheEntry = JSON.parse(cached);
    const now = Date.now();
    const expiryMs = CACHE_EXPIRY_HOURS * 60 * 60 * 1000;
    
    if (now - entry.timestamp > expiryMs) {
      localStorage.removeItem(key);
      return null;
    }
    
    console.log(`[Cache] Loaded ${entry.data.length} ${mediaType}s from cache`);
    return entry.data;
  } catch (error) {
    console.error('[Cache] Error reading cache:', error);
    return null;
  }
}

export function setCachedPool(mediaType: MediaType, data: EnrichedMedia[]): void {
  try {
    const key = `${CACHE_KEY_PREFIX}${mediaType}`;
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
    };
    
    localStorage.setItem(key, JSON.stringify(entry));
    console.log(`[Cache] Saved ${data.length} ${mediaType}s to cache`);
  } catch (error) {
    console.error('[Cache] Error saving cache:', error);
    // If storage is full, clear old caches
    try {
      localStorage.removeItem(`${CACHE_KEY_PREFIX}movie`);
      localStorage.removeItem(`${CACHE_KEY_PREFIX}tv`);
    } catch {
      // Ignore
    }
  }
}

export function clearCache(): void {
  try {
    localStorage.removeItem(`${CACHE_KEY_PREFIX}movie`);
    localStorage.removeItem(`${CACHE_KEY_PREFIX}tv`);
    console.log('[Cache] Cache cleared');
  } catch (error) {
    console.error('[Cache] Error clearing cache:', error);
  }
}
