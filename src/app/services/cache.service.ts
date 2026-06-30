import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { CacheEntry } from '../interfaces';

const CACHE_PREFIX = 'travel-tracker.cache.';

/**
 * Простий кеш із TTL, що зберігається в localStorage.
 *
 * Використовується, щоб не робити повторні запити до API для того самого
 * пошуку (місто + ключове слово) протягом 10 хвилин (environment.cacheTtlMs).
 *
 * Завдяки localStorage кеш переживає перезавантаження сторінки: якщо з моменту
 * запиту минуло менше 10 хв — дані беруться з кешу навіть після reload.
 */
@Injectable({ providedIn: 'root' })
export class CacheService {
  private storageKey(key: string): string {
    return CACHE_PREFIX + key;
  }

  private readEntry<T>(key: string): CacheEntry<T> | null {
    try {
      const raw = localStorage.getItem(this.storageKey(key));
      if (!raw) {
        return null;
      }
      const entry = JSON.parse(raw) as CacheEntry<T>;
      if (Date.now() > entry.expiresAt) {
        
        localStorage.removeItem(this.storageKey(key));
        return null;
      }
      return entry;
    } catch {
      return null;
    }
  }

  get<T>(key: string): T | null {
    return this.readEntry<T>(key)?.value ?? null;
  }

  set<T>(key: string, value: T, ttlMs: number = environment.cacheTtlMs): void {
    const entry: CacheEntry<T> = { value, expiresAt: Date.now() + ttlMs };
    try {
      localStorage.setItem(this.storageKey(key), JSON.stringify(entry));
    } catch {
      
    }
  }

  remainingMs(key: string): number {
    const entry = this.readEntry<unknown>(key);
    if (!entry) {
      return 0;
    }
    return Math.max(0, entry.expiresAt - Date.now());
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  clear(): void {
    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(CACHE_PREFIX)) {
          keys.push(k);
        }
      }
      keys.forEach((k) => localStorage.removeItem(k));
    } catch {
      
    }
  }
}
