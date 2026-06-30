/**
 * Типи сирих відповідей Foursquare Places API.
 * Описано лише поля, які реально використовуються в додатку.
 */

export interface FsqSearchResponse {
  results: FsqPlace[];
}

export interface FsqCategory {
  fsq_category_id?: string;
  id?: string;
  name: string;
}

export interface FsqLocation {
  formatted_address?: string;
  locality?: string;
}

export interface FsqGeocodes {
  main?: { latitude: number; longitude: number };
}

export interface FsqPhoto {
  id: string;
  prefix: string;
  suffix: string;
}

export interface FsqTip {
  id?: string;
  text: string;
  created_at?: string;
}

export interface FsqPlace {
  fsq_place_id?: string;
  fsq_id?: string;
  name: string;
  rating?: number;
  distance?: number;
  categories?: FsqCategory[];
  location?: FsqLocation;
  latitude?: number;
  longitude?: number;
  geocodes?: FsqGeocodes;
  photos?: FsqPhoto[];
  tips?: FsqTip[];
}
