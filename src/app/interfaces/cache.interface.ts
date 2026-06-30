/** Запис кешу з міткою часу протермінування. */
export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}
