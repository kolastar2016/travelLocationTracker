import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { Place, PlaceTip, SearchParams, FsqSearchResponse, FsqPlace } from '../interfaces';
import { CacheService } from './cache.service';

const CATEGORY_EMOJI: Record<string, string> = {
  museum: '🖼️',
  monument: '🏛️',
  landmark: '🏛️',
  park: '🌳',
  cafe: '☕',
  coffee: '☕',
  restaurant: '🍽️',
  bar: '🍸',
  hotel: '🏨',
  beach: '🏖️',
  theatre: '🎭',
  theater: '🎭',
  church: '⛪',
  castle: '🏰',
  market: '🛍️',
  garden: '🌷',
};

/**
 *
 * Джерело даних — ВИКЛЮЧНО реальний API (через dev-proxy) та кеш.
 * якщо API недоступний — повертається помилка.
 * Результати кешуються на 10 хвилин за ключем "місто", щоб не повторювати запити.
 */
@Injectable({ providedIn: 'root' })
export class PlacesService {
  private readonly http = inject(HttpClient);
  private readonly cache = inject(CacheService);

  readonly servedFromCache = signal(false);

  private cacheKey(params: SearchParams): string {
    return params.near.trim().toLowerCase();
  }

  cacheRemainingSeconds(params: SearchParams): number {
    return Math.round(this.cache.remainingMs(this.cacheKey(params)) / 1000);
  }

  search(params: SearchParams): Observable<Place[]> {
    const key = this.cacheKey(params);

    console.log('%c[PlacesService] 🔍 Запит на пошук', 'color:#7c3aed;font-weight:bold', {
      геолокація: params.near,
      ключКешу: key,
    });

    const cached = this.cache.get<Place[]>(key);
    if (cached) {
      this.servedFromCache.set(true);
      console.log(
        '%c[PlacesService] ⚡ Дані з КЕШУ (без запиту до API)',
        'color:#15803d;font-weight:bold',
        {
          ключКешу: key,
          залишилосьСекунд: Math.round(this.cache.remainingMs(key) / 1000),
          кількістьМісць: cached.length,
          місця: cached,
        },
      );
      return of(cached);
    }
    this.servedFromCache.set(false);

    if (!environment.foursquareApiKey) {
      console.warn('%c[PlacesService] ⚠️ Немає Foursquare API-ключа', 'color:#b45309');
      return throwError(
        () => new Error('Не задано Foursquare API-ключ (environment.foursquareApiKey).'),
      );
    }

    console.log('%c[PlacesService] 🌐 Кеш порожній → запит до Foursquare API', 'color:#1d4ed8;font-weight:bold');

    return this.searchFoursquare(params).pipe(
      tap((places) => {
        this.cache.set(key, places);
        console.log(
          '%c[PlacesService] ✅ Отримано дані з API (збережено в кеш на 10 хв)',
          'color:#7c3aed;font-weight:bold',
          { кількістьМісць: places.length, місця: places },
        );
      }),
    );
  }

  // ---- Foursquare Places API ----

  private get headers(): HttpHeaders {
    return new HttpHeaders({
      accept: 'application/json',
      Authorization: `Bearer ${environment.foursquareApiKey}`,
      'X-Places-Api-Version': environment.foursquareApiVersion,
    });
  }

  private searchFoursquare(params: SearchParams): Observable<Place[]> {
    // Через dev-proxy (обхід CORS): /foursquare/* → places-api.foursquare.com/*
    const url = 'https://places-api.foursquare.com' + '/places/search';

    const baseFields = [
      'fsq_place_id',
      'name',
      'distance',
      'categories',
      'location',
      'latitude',
      'longitude',
    ];
    
    const premiumFields = ['rating', 'photos', 'tips'];
    const fields = environment.premiumFeaturesEnabled
      ? [...baseFields, ...premiumFields]
      : baseFields;

    const queryParams: Record<string, string> = {
      near: params.near,
      limit: '24',
      fields: fields.join(','),
    };

    console.log('%c[Foursquare] → GET', 'color:#1d4ed8;font-weight:bold', url, queryParams);

    return this.http
      .get<FsqSearchResponse>(url, { headers: this.headers, params: queryParams })
      .pipe(
        map((res) => {
          
          console.log('%c[Foursquare] ← відповідь', 'color:#1d4ed8;font-weight:bold', res);
          const results = res.results ?? [];
          return results.map((r) => this.toPlace(r));
        }),
      );
  }

  private toPlace(raw: FsqPlace): Place {
    const id = raw.fsq_place_id ?? raw.fsq_id ?? raw.name;
    const categories = (raw.categories ?? []).map((c) => ({
      id: c.fsq_category_id ?? c.id ?? c.name,
      name: c.name,
    }));
    const mainCategory = categories[0]?.name ?? 'Місце';

    const apiPhotos = (raw.photos ?? []).map((p) => `${p.prefix}original${p.suffix}`);
    const photos = apiPhotos.length ? apiPhotos : this.placeholderPhotos(id);

    const tips: PlaceTip[] = (raw.tips ?? []).map((t, i) => ({
      id: t.id ?? `tip-${i}`,
      text: t.text,
      createdAt: t.created_at,
    }));

    const lat = raw.latitude ?? raw.geocodes?.main?.latitude;
    const lng = raw.longitude ?? raw.geocodes?.main?.longitude;

    return {
      id,
      name: raw.name,
      category: mainCategory,
      categories,
      rating: raw.rating ?? null,
      address: raw.location?.formatted_address ?? '',
      city: raw.location?.locality,
      distance: raw.distance ?? null,
      latitude: lat,
      longitude: lng,
      photos,
      tips,
      emoji: this.pickEmoji(mainCategory),
    };
  }

  /** Рандомні картинки-плейсхолдери (стабільні за seed) — picsum завжди завантажується. */
  private placeholderPhotos(id: string): string[] {
    const seed = encodeURIComponent(id);
    return [
      `https://picsum.photos/seed/${seed}-1/800/600`,
      `https://picsum.photos/seed/${seed}-2/800/600`,
    ];
  }

  private pickEmoji(category: string): string {
    const lower = category.toLowerCase();
    for (const key of Object.keys(CATEGORY_EMOJI)) {
      if (lower.includes(key)) {
        return CATEGORY_EMOJI[key];
      }
    }
    return '📍';
  }
}
