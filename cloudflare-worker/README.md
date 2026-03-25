# Cloudflare Worker Proxy для Supabase

Этот Cloudflare Worker позволяет обойти блокировку Supabase в России, проксируя все запросы через edge-сеть Cloudflare.

## Преимущества

✅ **Бесплатно** - до 100,000 запросов в день на бесплатном тарифе
✅ **Быстро** - edge-сеть Cloudflare обеспечивает низкую задержку
✅ **Просто** - минимальная настройка, не требует собственного сервера
✅ **Надежно** - работает на инфраструктуре Cloudflare

## Требования

- Аккаунт Cloudflare (бесплатный)
- Node.js 18+ и npm/pnpm
- Cloudflare Wrangler CLI

## Быстрый старт

### 1. Установка зависимостей

```bash
cd cloudflare-worker
npm install
# или
pnpm install
```

### 2. Авторизация в Cloudflare

```bash
npx wrangler login
```

Откроется браузер для авторизации в вашем аккаунте Cloudflare.

### 3. Тестирование локально

```bash
npm run dev
```

Worker запустится локально на `http://localhost:8787`. Вы можете протестировать его перед развертыванием.

### 4. Развертывание в продакшн

```bash
npm run deploy:production
```

После успешного развертывания вы получите URL вашего Worker, например:
```
https://submanager-supabase-proxy.your-subdomain.workers.dev
```

### 5. Настройка клиентского приложения

Скопируйте URL Worker и добавьте его в `.env.production` вашего основного приложения:

```env
VITE_SUPABASE_PROXY_URL=https://submanager-supabase-proxy.your-subdomain.workers.dev
```

Пересоберите и задеплойте приложение:

```bash
npm run build
```

## Настройка CORS (опционально)

По умолчанию Worker разрешает запросы от всех доменов (`*`). Для продакшна рекомендуется ограничить доступ только вашим доменам.

Откройте `src/index.js` и измените:

```javascript
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://your-domain.com', // Ваш домен
  // ... остальные заголовки
};
```

Или используйте переменные окружения в `wrangler.toml`:

```toml
[env.production.vars]
ALLOWED_ORIGINS = "https://your-domain.com,https://www.your-domain.com"
```

## Мониторинг и лимиты

### Бесплатный тариф Cloudflare Workers:
- ✅ 100,000 запросов в день
- ✅ 10ms CPU time на запрос
- ✅ Unlimited bandwidth

Для большей нагрузки доступен платный тариф Workers Paid ($5/месяц):
- ✅ 10 миллионов запросов в месяц
- ✅ 50ms CPU time на запрос

### Просмотр статистики

Перейдите в дашборд Cloudflare:
```
https://dash.cloudflare.com/ → Workers & Pages → submanager-supabase-proxy
```

Здесь вы увидите:
- Количество запросов
- Использование CPU
- Ошибки
- Графики производительности

## Обновление Worker

Если вам нужно обновить код Worker:

1. Внесите изменения в `src/index.js`
2. Разверните обновление:

```bash
npm run deploy:production
```

Обновление происходит мгновенно без простоя.

## Отладка

### Просмотр логов в реальном времени

```bash
npx wrangler tail
```

### Проверка работы Worker

```bash
curl https://your-worker-url.workers.dev/rest/v1/
```

Вы должны получить ответ от Supabase API.

## Безопасность

⚠️ **ВАЖНО**: В коде Worker содержится ваш `SUPABASE_ANON_KEY`. Это публичный ключ, который безопасен для использования на клиенте. Однако:

- ✅ Не добавляйте в Worker секретные ключи (service_role_key)
- ✅ Используйте Row Level Security (RLS) в Supabase
- ✅ Ограничьте CORS только вашими доменами в продакшне

## Альтернативы

Если Cloudflare Workers не подходит, рассмотрите:

1. **Backend Proxy на Express.js** - больше контроля, требует VPS
2. **Self-hosted Supabase** - полный контроль, сложнее настройка
3. **VPN/Proxy сервис** - временное решение

## Поддержка

Если возникли проблемы:

1. Проверьте логи: `npx wrangler tail`
2. Убедитесь, что Worker развернут: `npx wrangler deployments list`
3. Проверьте CORS настройки в `src/index.js`
4. Откройте issue в репозитории проекта

## Лицензия

MIT
