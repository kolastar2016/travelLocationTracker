import { HttpInterceptorFn, HttpParams } from '@angular/common/http';

export const foursquareInterceptor: HttpInterceptorFn = (req, next) => {
  const isGitHubPages = window.location.hostname.includes('github.io');

  if (req.url.includes('/foursquare') && isGitHubPages) {
    const queryParams = req.params.toString();
    
    // Заменяем локальный прокси на базовый домен Foursquare
    const originalFoursquareUrl = req.url.replace('/foursquare', 'https://foursquare.com');
    
    // Собираем ссылку с параметрами
    const fullOriginalUrl = queryParams ? `${originalFoursquareUrl}?${queryParams}` : originalFoursquareUrl;

    // Склеиваем с AllOrigins через правильный синтаксис ${...}
    const proxiedUrl = `https://allorigins.win${encodeURIComponent(fullOriginalUrl)}`;

    const modifiedReq = req.clone({
      url: proxiedUrl,
      params: new HttpParams() 
    });

    return next(modifiedReq);
  }

  return next(req);
};
