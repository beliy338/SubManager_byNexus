# ⚡ Быстрое решение ошибки "requested path is invalid"

## Проблема
```json
{
  "error": "requested path is invalid"
}
```

**Причина**: Старый файл использовал ES6 модули (`export default`), которые не поддерживаются в Cloudflare Dashboard.

**Решение**: Используйте новый файл `CLOUDFLARE_DASHBOARD_SIMPLE.js` ✅

## ✅ Решение 1: Через CLI (РЕКОМЕНДУЕТСЯ)

```bash
# 1. Установите Wrangler
npm install -g wrangler

# 2. Войдите в Cloudflare
wrangler login

# 3. Перейдите в папку
cd cloudflare-worker

# 4. Разверните Worker
wrangler deploy
```

**Готово!** Скопируйте полученный URL и добавьте в `.env.production`:
```env
VITE_SUPABASE_PROXY_URL=https://ваш-worker.workers.dev
```

---

## ⚠️ Решение 2: Через Dashboard

Если CLI недоступен:

1. **Откройте**: https://dash.cloudflare.com/
2. **Workers & Pages** → **Create Application** → **Create Worker**
3. **Название**: `submanager-supabase-proxy`
4. **Deploy** (не редактируйте код пока)
5. **Quick Edit** → удалите весь код
6. **Код**: Скопируйте из файла `CLOUDFLARE_DASHBOARD_SIMPLE.js` ✅
7. **Вставьте** код и нажмите **Save and Deploy**

### ❗ ВАЖНО при копировании:
- ✅ Используйте файл `CLOUDFLARE_DASHBOARD_SIMPLE.js` (новый!)
- ❌ НЕ используйте `cloudflare-worker-dashboard-copy.js` (старый, не работает)
- ✅ Копируйте весь код целиком
- ✅ Удалите старый код перед вставкой нового

---

## 🔍 Проверка

```bash
curl https://ваш-worker.workers.dev/rest/v1/
```

Должен вернуться JSON от Supabase ✅

---

## 🔧 Если не работает

### Ошибка "requested path is invalid"
👉 Используйте CLI (Решение 1) или файл `cloudflare-worker-dashboard-copy.js`

### CORS ошибки
👉 Проверьте что в коде есть `CORS_HEADERS`

### "Worker threw exception"
👉 Проверьте логи: `wrangler tail`

---

## 📁 Файлы

- ✅ **Для Dashboard**: `CLOUDFLARE_DASHBOARD_SIMPLE.js`
- ✅ **Для CLI**: `cloudflare-worker/src/index.js`
- 📖 **Подробная инструкция**: `ИНСТРУКЦИЯ_CLOUDFLARE_WORKER.html`
- 📖 **Полный гайд**: `CLOUDFLARE_DEPLOY_GUIDE_RU.md`

---

## 💡 Совет

Используйте **Wrangler CLI** (Решение 1) - это самый простой и надёжный способ. Никаких проблем с копированием кода!