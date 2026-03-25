# Настройка Cloudflare Worker для обхода блокировки Supabase

## Проблема

Supabase заблокирован в России, и приложение не работает без VPN.

## Решение

Используем Cloudflare Workers как прокси-слой между клиентом и Supabase. Worker работает на edge-серверах Cloudflare по всему миру и не блокируется в России.

## Архитектура

```
[Пользователь в России]
    ↓
[Cloudflare Worker] (доступен без VPN)
    ↓
[Supabase API] (заблокирован в России)
```

## Пошаговая инструкция

### Шаг 1: Создание аккаунта Cloudflare

1. Перейдите на https://dash.cloudflare.com/sign-up
2. Зарегистрируйтесь (бесплатно)
3. Подтвердите email

### Шаг 2: Установка Wrangler CLI

Wrangler - это CLI для работы с Cloudflare Workers.

```bash
npm install -g wrangler
# или
pnpm add -g wrangler
```

Проверьте установку:
```bash
wrangler --version
```

### Шаг 3: Авторизация

```bash
wrangler login
```

Откроется браузер для авторизации. Разрешите доступ.

### Шаг 4: Настройка Worker

1. Перейдите в папку worker:
```bash
cd cloudflare-worker
```

2. Установите зависимости:
```bash
npm install
# или
pnpm install
```

3. (Опционально) Измените имя worker в `wrangler.toml`:
```toml
name = "your-custom-name"  # Измените на свое имя
```

### Шаг 5: Тестирование локально

Запустите Worker локально:
```bash
npm run dev
```

Worker будет доступен на `http://localhost:8787`

Протестируйте в другом терминале:
```bash
curl http://localhost:8787/rest/v1/
```

Если видите ответ от Supabase - всё работает!

### Шаг 6: Развертывание в Cloudflare

```bash
npm run deploy:production
```

Вы получите URL вашего Worker:
```
✨ Success! Uploaded to Cloudflare
🌍 https://submanager-supabase-proxy.your-subdomain.workers.dev
```

**Скопируйте этот URL!** Он вам понадобится.

### Шаг 7: Настройка основного приложения

1. Вернитесь в корневую папку проекта:
```bash
cd ..
```

2. Создайте файл `.env.production`:
```bash
cp .env.production.example .env.production
```

3. Откройте `.env.production` и добавьте URL Worker:
```env
VITE_SUPABASE_PROXY_URL=https://submanager-supabase-proxy.your-subdomain.workers.dev
```

4. Пересоберите приложение:
```bash
npm run build
```

5. Задеплойте обновленное приложение на ваш хостинг.

### Шаг 8: Проверка

1. Откройте приложение **БЕЗ VPN**
2. Попробуйте войти в аккаунт
3. Проверьте работу подписок

Если всё работает - поздравляю! 🎉

## Проверка работы Worker

### Через браузер

Откройте в браузере:
```
https://your-worker-url.workers.dev/rest/v1/
```

Должны увидеть JSON ответ от Supabase.

### Через curl

```bash
curl https://your-worker-url.workers.dev/rest/v1/
```

### Просмотр логов

```bash
cd cloudflare-worker
npx wrangler tail
```

Теперь откройте приложение и выполните какое-то действие. В терминале вы увидите логи запросов.

## Настройка для разработки

Для локальной разработки вы можете:

1. **Использовать VPN** и работать с Supabase напрямую (рекомендуется)
   - Оставьте `.env.development` пустым
   - Запустите `npm run dev`

2. **Использовать Worker даже локально**
   - Запустите Worker: `cd cloudflare-worker && npm run dev`
   - В `.env.development` укажите: `VITE_SUPABASE_PROXY_URL=http://localhost:8787`
   - Запустите приложение: `npm run dev`

## Мониторинг

### Дашборд Cloudflare

1. Откройте https://dash.cloudflare.com/
2. Перейдите в **Workers & Pages**
3. Выберите ваш Worker
4. Здесь вы увидите:
   - Количество запросов
   - Графики производительности
   - Ошибки
   - CPU время

### Лимиты бесплатного тарифа

- ✅ 100,000 запросов в день
- ✅ 10ms CPU time на запрос
- ✅ Неограниченный трафик

Для небольших и средних проектов этого более чем достаточно!

### Когда нужен платный тариф?

Если ваше приложение получает:
- Более 100,000 запросов в день
- Или более 3,000,000 запросов в месяц

Тогда рассмотрите Workers Paid ($5/месяц):
- 10 миллионов запросов в месяц
- 50ms CPU time на запрос

## Обновление Worker

Если нужно обновить код Worker:

1. Внесите изменения в `cloudflare-worker/src/index.js`
2. Разверните:
```bash
cd cloudflare-worker
npm run deploy:production
```

Обновление применится мгновенно без простоя.

## Безопасность

### CORS настройки

По умолчанию Worker принимает запросы от всех доменов (`*`). Для продакшна рекомендуется ограничить:

В `cloudflare-worker/src/index.js` измените:

```javascript
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://your-domain.com',
  // ...
};
```

### Custom Domain (опционально)

Вы можете подключить свой домен к Worker:

1. В Cloudflare Dashboard → Workers & Pages → ваш Worker
2. Settings → Triggers → Custom Domains
3. Add Custom Domain: `api.your-domain.com`
4. Обновите `.env.production`:
```env
VITE_SUPABASE_PROXY_URL=https://api.your-domain.com
```

## Устранение неполадок

### Worker не работает

1. Проверьте развертывание:
```bash
npx wrangler deployments list
```

2. Проверьте логи:
```bash
npx wrangler tail
```

3. Проверьте статус Cloudflare:
https://www.cloudflarestatus.com/

### Приложение всё ещё не работает без VPN

1. Убедитесь, что в `.env.production` указан правильный URL Worker
2. Проверьте, что приложение пересобрано: `npm run build`
3. Очистите кэш браузера (Ctrl+Shift+R)
4. Проверьте Console в DevTools браузера на ошибки

### Ошибки CORS

Проверьте настройки CORS в `cloudflare-worker/src/index.js`:

```javascript
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*', // Разрешить всем
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info, prefer, x-upsert',
};
```

## FAQ

**Q: Это безопасно?**
A: Да! Worker использует только публичный `anon_key` от Supabase, который безопасен для клиента. Вся защита данных обеспечивается через Row Level Security (RLS) в Supabase.

**Q: Будет ли это медленнее?**
A: Минимально. Cloudflare имеет edge-серверы по всему миру, включая близко к России. Задержка обычно составляет 10-50ms.

**Q: Что если Cloudflare тоже заблокируют?**
A: Cloudflare - одна из крупнейших CDN-сетей в мире. Если его заблокируют, половина интернета перестанет работать в России. Но в этом случае можно переключиться на backend proxy на VPS.

**Q: Сколько это стоит?**
A: Бесплатно до 100,000 запросов/день. Для большинства проектов этого достаточно.

**Q: Можно ли использовать с другими заблокированными сервисами?**
A: Да! Тот же подход работает для любых API: Firebase, Google Sheets API, и т.д.

## Дополнительные ресурсы

- [Документация Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [Cloudflare Workers Examples](https://developers.cloudflare.com/workers/examples/)

## Поддержка

Если возникли вопросы или проблемы, создайте issue в репозитории проекта.

---

**Удачи! 🚀**
