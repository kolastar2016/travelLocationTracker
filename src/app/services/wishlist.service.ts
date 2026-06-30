import { Injectable, computed, effect, signal } from '@angular/core';
import { Place } from '../interfaces';

const STORAGE_KEY = 'travel-tracker.wishlist';

/**
 * Список бажаних місць (wishlist).
 *
 * Стан зберігається у localStorage, тож не зникає при перезавантаженні сторінки.
 * Будь-яка зміна автоматично синхронізується завдяки `effect`.
 */
@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly _items = signal<Place[]>(this.load());

  readonly items = this._items.asReadonly();
  
  readonly count = computed(() => this._items().length);

  constructor() {
    
    effect(() => {
      this.persist(this._items());
    });
  }

  isSaved(id: string): boolean {
    return this._items().some((p) => p.id === id);
  }

  add(place: Place): void {
    if (!this.isSaved(place.id)) {
      this._items.update((list) => [...list, place]);
    }
  }

  remove(id: string): void {
    this._items.update((list) => list.filter((p) => p.id !== id));
  }

  toggle(place: Place): boolean {
    if (this.isSaved(place.id)) {
      this.remove(place.id);
      return false;
    }
    this.add(place);
    return true;
  }

  clear(): void {
    this._items.set([]);
  }

  private load(): Place[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Place[]) : [];
    } catch {
      return [];
    }
  }

  private persist(items: Place[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      
    }
  }
}
