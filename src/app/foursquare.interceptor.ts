import { HttpInterceptorFn, HttpParams } from '@angular/common/http';

export const foursquareInterceptor: HttpInterceptorFn = (req, next) => {
  try {
    const isGitHubPages = window.location.hostname.includes('github.io');

    if (req.url.includes('/foursquare')) {
      console.log('%c[Interceptor] Обнаружен запрос к Foursquare!', 'color: #7c3aed; font-weight: bold;');

      if (isGitHubPages) {
        console.log('%c[Interceptor] Режим GitHub Pages. Собираем URL с нуля...', 'color: #f59e0b; font-weight: bold;');

        // 1. Извлекаем query-параметры (near, limit, fields)
        const queryParamsString = req.params.toString();

        // 2. Жестко и канонично задаем базовый эндпоинт Foursquare API v3
        const baseFoursquareUrl = 'https://foursquare.com';
        
        // 3. Склеиваем параметры с базовым URL
        const fullOriginalUrl = queryParamsString ? `${baseFoursquareUrl}?${queryParamsString}` : baseFoursquareUrl;

        // 4. Оборачиваем ВЕСЬ адрес в AllOrigins через /raw?url=
        // ВНИМАТЕЛЬНО: проверяйте наличие /raw?url= в строке ниже!
        const proxiedUrl = `https://allorigins.win/raw?url=${encodeURIComponent(fullOriginalUrl)}`;

        console.log('%c[Interceptor] Финальный URL для Network:', 'color: #10b981;', proxiedUrl);

        // 5. Клонируем запрос с правильным URL
        const modifiedReq = req.clone({
          url: proxiedUrl,
          params: new HttpParams() // Очищаем параметры, так как они уже зашиты внутри url
        });

        return next(modifiedReq);
      }
    }
  } catch (error) {
    console.error('%c[Interceptor] КРИТИЧЕСКАЯ ОШИБКА:', 'color: red;', error);
  }

  return next(req);
};
