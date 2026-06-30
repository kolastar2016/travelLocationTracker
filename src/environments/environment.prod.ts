/**
 * Конфігурація додатку.
 *
 * Щоб використати РЕАЛЬНІ дані Foursquare Places API:
 *  1. Зареєструйтесь на https://foursquare.com/developers/
 *  2. Створіть проєкт і отримайте Service Key (Places API).
 *  3. Вставте ключ у поле `foursquareApiKey` нижче.
 *  4. Запускайте додаток через `npm start` (ng serve використовує proxy.conf.json).
 *
 * ВАЖЛИВО (обмеження Foursquare):
 *  - Новий Places API НЕ підтримує CORS, тому прямі запити з браузера блокуються.
 *    Тому запити йдуть через dev-proxy (proxy.conf.json) на шлях `/foursquare`,
 *    який Angular dev-server перенаправляє на places-api.foursquare.com.
 *  - Поля rating, фотографії та відгуки (tips) — Premium і потребують платних
 *    кредитів. На безкоштовному ключі доступний лише базовий пошук (назва,
 *    категорія, адреса, координати, відстань); rating/фото/відгуки прийдуть
 *    порожніми, доки не активовано Premium.
 *
 */
export const environment = {
  production: true,

  /** Service Key для Foursquare Places API. Залиште порожнім для демо-режиму. */
  foursquareApiKey: 'KRNPCNCJCZUBAKJFGMGMBHSKTV554I5RVJU4KAIP0FDGUJKD',

  /** Версія Foursquare Places API (заголовок X-Places-Api-Version). */
  foursquareApiVersion: '2025-06-17',

  /**
   * Шлях до Foursquare через dev-proxy (обхід CORS).
   * proxy.conf.json перенаправляє `/foursquare/*` → `https://places-api.foursquare.com/*`.
   */
  foursquareProxyPath: '/foursquare',

  /** Прямий URL API (для довідки / серверного проксі у продакшні). */
  foursquareBaseUrl: 'https://places-api.foursquare.com',

  /**
   * Чи увімкнені Premium-функції Foursquare (рейтинг, фото, відгуки).
   * Ці поля платні й потребують кредитів. Поки false — додаток НЕ робить
   * платних запитів.
   * Поставте true, якщо акаунт має кредити (див. places.service.ts).
   */
  premiumFeaturesEnabled: false,

  /** Час життя кешу пошукових запитів (10 хвилин у мілісекундах). */
  cacheTtlMs: 10 * 60 * 1000,
};
