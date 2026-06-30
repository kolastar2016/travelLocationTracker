export default async function handler(req, res) {
  // Добавляем заголовки CORS, чтобы ваш фронтенд мог свободно общаться с этим бэкендом
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Получаем город и поля из запроса фронтенда
  const { near, fields, limit } = req.query;

  // Формируем чистый, прямой запрос к Foursquare с вашего сервера (на сервере CORS не существует!)
  const foursquareUrl = `https://foursquare.com{encodeURIComponent(near)}&limit=${limit || 24}&fields=${fields}`;

  try {
    const response = await fetch(foursquareUrl, {
      headers: {
        'Authorization': 'WX0LHAZV4LL0KEN35MY0OQTPCOEX1ADI1XHFZ2TKZXRRD4MY', // Ваш ключ теперь в безопасности на сервере
        'X-Places-Api-Version': '2025-06-17',
        'accept': 'application/json'
      }
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
