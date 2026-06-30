import { HttpInterceptorFn, HttpParams } from '@angular/common/http';
import { environment } from '../environments/environment';

export const foursquareInterceptor: HttpInterceptorFn = (req, next) => {
  const isGitHubPages = window.location.hostname.includes('github.io');

  if (req.url.includes('/foursquare') && isGitHubPages) {
    console.log('%c[Interceptor] Перехват для GitHub Pages. Проксируем через CORS-Anywhere...', 'color: #7c3aed; font-weight: bold;');

    // 1. Берем только query-параметры (near, limit, fields)
    const queryParamsString = req.params.toString();

    // 2. Жестко собираем КАНОНИЧНЫЙ и правильный URL для API Foursquare v3
    const baseFoursquareUrl = 'https://places-api.foursquare.com';
    const fullFoursquareUrl = queryParamsString ? `${baseFoursquareUrl}?${queryParamsString}` : baseFoursquareUrl;

    // 3. Просто приписываем CORS-прокси в начало строки. Никакого encodeURIComponent не нужно!
    const proxiedUrl = fullFoursquareUrl;

    console.log('%c[Interceptor] Итоговый URL:', 'color: #10b981;', proxiedUrl);

    // 4. Клонируем запрос с правильными заголовками авторизации
    const modifiedReq = req.clone({
      url: proxiedUrl,
      setHeaders: {
        'Authorization': environment.foursquareApiKey,
        'X-Places-Api-Version': environment.foursquareApiVersion,
        'accept': 'application/json'
      }
    });

    return next(modifiedReq);
  }

  return next(req);
};
