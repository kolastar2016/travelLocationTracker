import { HttpInterceptorFn, HttpParams } from '@angular/common/http';

export const foursquareInterceptor: HttpInterceptorFn = (req, next) => {
  try {
    const isGitHubPages = window.location.hostname.includes('github.io');

    // Проверяем, относится ли запрос к Foursquare
    if (req.url.includes('/foursquare')) {
      console.log('%c[Interceptor] Обнаружен запрос к Foursquare! Хост:', 'color: #7c3aed; font-weight: bold;', window.location.hostname);

      if (isGitHubPages) {
        console.log('%c[Interceptor] Режим GitHub Pages. Перенаправляем на CORS-прокси...', 'color: #f59e0b; font-weight: bold;');

        // 1. Извлекаем текущие query-параметры в виде строки
        const queryParamsString = req.params.toString();

        // 2. Формируем чистый URL к Foursquare (меняем префикс на реальный домен API с версией /v3)
        // Если в запросе '/foursquare/places/search', то получится 'https://foursquare.com'
        const cleanUrl = req.url.replace('/foursquare', 'https://foursquare.com');
        
        // Склеиваем домен, путь и параметры воедино
        const fullOriginalUrl = queryParamsString ? `${cleanUrl}?${queryParamsString}` : cleanUrl;

        // 3. Упаковываем это в AllOrigins прокси
        const proxiedUrl = `https://allorigins.win${encodeURIComponent(fullOriginalUrl)}`;

        console.log('%c[Interceptor] Финальный URL для Network:', 'color: #10b981;', proxiedUrl);

        // 4. Клонируем запрос: заменяем URL на проксированный, а параметры обнуляем
        const modifiedReq = req.clone({
          url: proxiedUrl,
          params: new HttpParams()
        });

        return next(modifiedReq);
      } else {
        console.log('%c[Interceptor] Режим Локальный (localhost). Запрос идет стандартно через proxy.conf.json', 'color: #1d4ed8;');
      }
    }
  } catch (error) {
    // Если упала какая-то строковая функция, мы увидим это в консоли, а не пустой экран
    console.error('%c[Interceptor] КРИТИЧЕСКАЯ ОШИБКА ВНУТРИ ИНТЕРЦЕПТОРА:', 'color: red; font-weight: bold;', error);
  }

  // Если мы локально или произошел сбой — пропускаем запрос как есть
  return next(req);
};
