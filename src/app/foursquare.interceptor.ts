import { HttpInterceptorFn, HttpParams } from '@angular/common/http';

export const foursquareInterceptor: HttpInterceptorFn = (req, next) => {
  // Проверяем, запущен ли сайт на GitHub Pages
  const isGitHubPages = window.location.hostname.includes('github.io');

  // Если это запрос к Foursquare и мы на GitHub Pages
  if (req.url.includes('/foursquare') && isGitHubPages) {
    
    // 1. Вытаскиваем все query-параметры (near, limit, fields), которые Angular добавил в запрос
    const queryParams = req.params.toString();
    
    // 2. Формируем чистый оригинальный URL для Foursquare API
    // Заменяем '/foursquare' на реальный домен и добавляем '/v3' (так как в сервисе у вас /places/search, а нужно /v3/places/search)
    const originalFoursquareUrl = req.url.replace('/foursquare', 'https://foursquare.com');
    
    // Склеиваем путь и параметры, если они есть
    const fullOriginalUrl = queryParams ? `${originalFoursquareUrl}?${queryParams}` : originalFoursquareUrl;

    // 3. Оборачиваем всё в CORS-прокси AllOrigins
    const proxiedUrl = `https://allorigins.win{encodeURIComponent(fullOriginalUrl)}`;

    // 4. Клонируем запрос с новым URL и очищаем старые параметры, так как они уже зашиты внутри url
    const modifiedReq = req.clone({
      url: proxiedUrl,
      params: new HttpParams() 
    });

    return next(modifiedReq);
  }

  // Если мы локально на localhost, интерцептор ничего не делает, и работает ваш proxy.conf.json
  return next(req);
};
