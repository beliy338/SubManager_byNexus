# Развертывание Cloudflare Worker - Пошаговая инструкция

## Проблема
При попытке добавить код через Dashboard появляется ошибка:
```json
{
  "error": "requested path is invalid"
}
```

## Решение 1: Деплой через Wrangler CLI (РЕКОМЕНДУЕТСЯ)

### Шаг 1: Установите Wrangler CLI

```bash
npm install -g wrangler
# или используя pnpm
pnpm add -g wrangler
```

### Шаг 2: Войдите в аккаунт Cloudflare

```bash
wrangler login
```

Откроется браузер, где нужно авторизоваться в вашем аккаунте Cloudflare.

### Шаг 3: Перейдите в директорию worker

```bash
cd cloudflare-worker
```

### Шаг 4: Разверните Worker

```bash
wrangler deploy
```

Вы получите URL вашего worker, например:
```
https://submanager-supabase-proxy.your-subdomain.workers.dev
```

### Шаг 5: Используйте URL в вашем приложении

Скопируйте полученный URL и добавьте в `.env.production`:
```env
VITE_SUPABASE_PROXY_URL=https://submanager-supabase-proxy.your-subdomain.workers.dev
```

---

## Решение 2: Деплой через Dashboard (если нет доступа к CLI)

Если по каким-то причинам вы не можете использовать CLI, используйте этот код для Dashboard:

### Шаг 1: Откройте Cloudflare Dashboard
1. Перейдите на https://dash.cloudflare.com/
2. Workers & Pages → Create Application → Create Worker
3. Назовите Worker: `submanager-supabase-proxy`

### Шаг 2: Скопируйте код из файла
Используйте код из файла `cloudflare-worker/src/index.js` (см. ниже)

### Шаг 3: Вставьте код и сохраните
1. Удалите весь код в редакторе
2. Вставьте новый код
3. Нажмите "Deploy"

### ⚠️ ВАЖНО при использовании Dashboard:
- Код должен быть в формате ES Module (с `export default`)
- НЕ копируйте комментарии вида `// КОПИРУЙТЕ ВСЁ ЧТО НИЖЕ`
- Убедитесь что у вас НЕТ символов BOM или невидимых символов

---

## Частые ошибки

### 1. "requested path is invalid"
**Причина**: Неправильный формат кода или лишние символы
**Решение**: Используйте Wrangler CLI или проверьте код на лишние символы

### 2. CORS ошибки
**Причина**: Неправильные заголовки CORS
**Решение**: Убедитесь что в коде есть все CORS заголовки (см. код ниже)

### 3. "Worker threw exception"
**Причина**: Ошибка в коде
**Решение**: Проверьте логи через `wrangler tail`

---

## Проверка работы Worker

После деплоя проверьте работу:

```bash
curl https://ваш-worker-url.workers.dev/rest/v1/
```

Вы должны получить ответ от Supabase API.

---

## Поддержка

Если проблемы продолжаются:
1. Используйте Wrangler CLI (решение 1) - это надежнее
2. Проверьте логи: `wrangler tail`
3. Убедитесь что ваш аккаунт Cloudflare активирован
4. Проверьте что вы скопировали весь код целиком
