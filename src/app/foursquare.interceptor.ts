import { HttpInterceptorFn, HttpParams } from '@angular/common/http';
import { environment } from '../environments/environment'; // Убедитесь в правильности пути к вашему файлу environment

export const foursquareInterceptor: HttpInterceptorFn = (req, next) => {
  try {
    const isGitHubPages = window.location.hostname.includes('github.io');

    if (req.url.includes('/foursquare')) {
      console.log('%c[Interceptor] Обнаружен запрос к Foursquare!', 'color: #7c3aed; font-weight: bold;');

      if (isGitHubPages) {
        console.log('%c[Interceptor] Режим GitHub Pages. Собираем URL через AllOrigins...', 'color: #f59e0b; font-weight: bold;');

        // 1. Получаем параметры поиска (near, limit, fields), которые передал сервис
        const originalParams = req.params.toString();

        // 2. Жестко задаем базовый эндпоинт Foursquare API v3
        const baseFoursquareUrl = 'https://foursquare.com';
        
        // Склеиваем базовый URL и параметры поиска
        const fullFoursquareUrl = originalParams ? `${baseFoursquareUrl}?${originalParams}` : baseFoursquareUrl;

        // 3. Формируем финальный URL для AllOrigins
        const proxiedUrl = `https://allorigins.win/raw?url=${encodeURIComponent(fullFoursquareUrl)}`;

        console.log('%c[Interceptor] Финальный URL для Network:', 'color: #10b981;', proxiedUrl);

        // 4. КЛОНИРУЕМ ЗАПРОС:
        // - Меняем URL на проксированный
        // - Очищаем заголовки 'Authorization' и 'X-Places-Api-Version', чтобы браузер НЕ отправлял проверочный запрос OPTIONS (Preflight)
        // - Передаем ваш API-ключ прямо в заголовках к AllOrigins (он пробросит их на Foursquare)
        const modifiedReq = req.clone({
          url: proxiedUrl,
          params: new HttpParams(), // Очищаем параметры, они уже внутри url
          setHeaders: {
            'Authorization': `Bearer ${environment.foursquareApiKey}`,
            'X-Places-Api-Version': environment.foursquareApiVersion,
            'accept': 'application/json'
          }
        });

        return next(modifiedReq);
      }
    }
  } catch (error) {
    console.error('%c[Interceptor] КРИТИЧЕСКАЯ ОШИБКА:', 'color: red;', error);
  }

  return next(req);
};
