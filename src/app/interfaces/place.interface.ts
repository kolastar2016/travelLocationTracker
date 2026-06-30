/** Категорія/тип місця. */
export interface PlaceCategory {
  id: string;
  name: string;
  icon?: string;
}

/** Короткий відгук / порада про місце. */
export interface PlaceTip {
  id: string;
  text: string;
  author?: string;
  createdAt?: string;
}

/** Нормалізована модель місця (дані Foursquare Places API). */
export interface Place {
  id: string;
  name: string;
  category: string;
  categories: PlaceCategory[];
  rating: number | null;
  address: string;
  city?: string;
  distance?: number | null;
  latitude?: number;
  longitude?: number;
  photos: string[];
  tips: PlaceTip[];
  emoji: string;
}

/** Параметри пошуку. */
export interface SearchParams {
  query: string;
  near: string;
}
