# 🇷🇺 Настройка Gemini AI для пользователей из России

## ⚠️ Проблема

Google Gemini API заблокирован в России. При попытке использования вы можете получить ошибку:
- `Failed to fetch`
- `Network error`
- `Connection refused`

## ✅ Решения

### Вариант 1: VPN (Самый простой) ⭐ Рекомендуется

#### Шаг 1: Установите VPN

**Бесплатные VPN:**
- **ProtonVPN** (бесплатный tier, хорошая скорость)
- **Windscribe** (10 GB/месяц бесплатно)
- **Cloudflare WARP** (быстрый, бесплатный)

**Платные VPN (более стабильные):**
- **Mullvad** (5€/месяц)
- **IVPN** (от $6/месяц)
- **Outline** (можно развернуть свой сервер)

#### Шаг 2: Получите API ключ

1. Включите VPN (выберите сервер в Европе/США)
2. Откройте https://aistudio.google.com/app/apikey
3. Создайте API ключ
4. Скопируйте его

#### Шаг 3: Настройте приложение

После получения ключа **VPN можно отключить**. API запросы из приложения будут работать.

```typescript
// В файле /src/app/utils/gemini.ts
const API_KEY = 'AIzaSy...ваш-ключ...';
```

---

### Вариант 2: Cloudflare Workers (Прокси)

Создайте бесплатный прокси через Cloudflare Workers.

#### Шаг 1: Создайте Worker

1. Зарегистрируйтесь на https://dash.cloudflare.com
2. Перейдите в **Workers & Pages**
3. Нажмите **Create Application** → **Create Worker**
4. Вставьте код:

```javascript
// Прокси для Google Gemini API
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-goog-api-key',
  }

  // Handle preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(request.url)
    
    // Проксируем на Gemini API
    const geminiUrl = `https://generativelanguage.googleapis.com${url.pathname}${url.search}`
    
    const newRequest = new Request(geminiUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body
    })
    
    const response = await fetch(newRequest)
    const newResponse = new Response(response.body, response)
    
    // Добавляем CORS headers
    Object.keys(corsHeaders).forEach(key => {
      newResponse.headers.set(key, corsHeaders[key])
    })
    
    return newResponse
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}
```

5. Нажмите **Deploy**
6. Скопируйте URL вашего worker (например: `https://gemini-proxy.your-name.workers.dev`)

#### Шаг 2: Обновите код приложения

Создайте файл `/src/app/utils/gemini-proxy.ts`:

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

// URL вашего Cloudflare Worker
const PROXY_URL = 'https://gemini-proxy.your-name.workers.dev';
const API_KEY = 'YOUR_GEMINI_API_KEY_HERE';

let genAI: GoogleGenerativeAI | null = null;

// Инициализация Gemini API через прокси
export const initGemini = () => {
  if (!genAI && API_KEY !== 'YOUR_GEMINI_API_KEY_HERE') {
    genAI = new GoogleGenerativeAI(API_KEY);
    
    // Переопределяем базовый URL на прокси
    // @ts-ignore - Частное свойство, но работает
    if (genAI._baseUrl) {
      genAI._baseUrl = PROXY_URL;
    }
  }
  return genAI;
};

// Экспортируем все функции из оригинального gemini.ts
export * from './gemini';
```

Затем обновите импорты в компонентах:

```typescript
// Было:
import { parseEmailForSubscription } from '../utils/gemini';

// Стало:
import { parseEmailForSubscription } from '../utils/gemini-proxy';
```

---

### Вариант 3: Собственный VPS прокси

Если у вас есть VPS за границей, можете настроить прокси.

#### Установка Nginx прокси

```bash
# На вашем VPS
sudo apt update
sudo apt install nginx

# Настройте Nginx
sudo nano /etc/nginx/sites-available/gemini-proxy
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass https://generativelanguage.googleapis.com;
        proxy_set_header Host generativelanguage.googleapis.com;
        proxy_set_header X-Real-IP $remote_addr;
        
        # CORS headers
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, x-goog-api-key' always;
        
        if ($request_method = 'OPTIONS') {
            return 204;
        }
    }
}
```

```bash
# Включите конфиг
sudo ln -s /etc/nginx/sites-available/gemini-proxy /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

Используйте URL прокси в приложении:

```typescript
const PROXY_URL = 'http://your-domain.com';
```

---

## 🧪 Проверка работы

### Тест через curl

```bash
# Проверьте доступность API (через VPN или прокси)
curl -H "x-goog-api-key: YOUR_API_KEY" \
     "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent" \
     -H 'Content-Type: application/json' \
     -d '{"contents":[{"parts":[{"text":"Привет!"}]}]}'
```

### Тест в приложении

```typescript
import { parseEmailForSubscription } from './utils/gemini';

const testEmail = `
Привет! Ваша подписка на Spotify продлена.
Сумма: 199 ₽
Дата списания: 25 апреля 2026
`;

try {
  const result = await parseEmailForSubscription(testEmail);
  console.log('✅ Gemini работает:', result);
} catch (error) {
  console.error('❌ Ошибка:', error);
}
```

---

## ❓ FAQ

### Q: Нужен ли VPN после получения ключа?

**A:** Зависит от метода:
- **VPN**: Нет, ключ работает и без VPN
- **Прокси**: Нет, прокси обрабатывает запросы
- **Без ничего**: Да, нужен VPN для каждого запроса

### Q: Какой метод самый быстрый?

**A:** 
1. **VPN + прямое подключение** - самый быстрый
2. **Cloudflare Workers** - быстро, но есть задержка
3. **Собственный VPS** - скорость зависит от сервера

### Q: Безопасно ли использовать прокси?

**A:** 
- ✅ **Cloudflare Workers** - безопасно, код контролируете вы
- ⚠️ **Чужие прокси** - НЕ рекомендуется, могут перехватывать ключи
- ✅ **Свой VPS** - безопасно

### Q: Можно ли использовать бесплатный VPN?

**A:** Да, но:
- Скорость может быть ниже
- Ограничения трафика
- Для получения ключа достаточно

### Q: А если Vertex AI?

**A:** Vertex AI:
- ❌ Требует Google Cloud проект
- ❌ Платный (нет бесплатного tier)
- ❌ Сложнее в настройке
- ❌ Все равно заблокирован в РФ

**Вердикт:** Gemini API с VPN/прокси - лучший вариант

---

## 🎯 Рекомендации

### Для разработки
→ Используйте **VPN** (ProtonVPN, Cloudflare WARP)

### Для production
→ Используйте **Cloudflare Workers** (бесплатно, надежно)

### Для корпоративного использования
→ Настройте **собственный VPS прокси**

---

## 📞 Поддержка

Если возникли проблемы:
1. Проверьте настройки VPN/прокси
2. Убедитесь, что API ключ валидный
3. Проверьте логи браузера (F12 → Console)
4. Напишите в поддержку SubManager

---

**Удачи!** 🚀 С правильной настройкой Gemini AI будет работать как часы!
