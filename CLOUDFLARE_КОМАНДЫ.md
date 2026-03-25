# 🚀 Cloudflare Worker - Шпаргалка команд

## 📋 Быстрый старт

### Вариант А: Через Dashboard (без терминала)
```
1. Откройте: https://dash.cloudflare.com/
2. Workers & Pages → Create Worker
3. Название: submanager-supabase-proxy
4. Deploy → Quick Edit
5. Удалите весь код
6. Скопируйте код из файла: CLOUDFLARE_DASHBOARD_SIMPLE.js
7. Save and Deploy
```

### Вариант Б: Через CLI (с терминалом)
```bash
# Установка Wrangler (один раз)
npm install -g wrangler

# Авторизация (один раз)
wrangler login

# Деплой Worker
cd cloudflare-worker
wrangler deploy
```

---

## 🔧 Полезные команды Wrangler

```bash
# Показать версию
wrangler --version

# Войти в аккаунт
wrangler login

# Выйти из аккаунта
wrangler logout

# Список всех Workers
wrangler list

# Деплой Worker
wrangler deploy

# Деплой с именем
wrangler deploy --name submanager-proxy

# Просмотр логов в реальном времени
wrangler tail

# Просмотр логов конкретного Worker
wrangler tail submanager-supabase-proxy

# Удалить Worker
wrangler delete submanager-supabase-proxy

# Запустить локально для тестирования
wrangler dev

# Информация о Worker
wrangler whoami
```

---

## 📝 Настройка переменных окружения

### В файле wrangler.toml
```toml
name = "submanager-supabase-proxy"
main = "src/index.js"
compatibility_date = "2024-01-01"
```

### Через Dashboard
```
Worker → Settings → Variables → Add Variable
```

### Через CLI
```bash
wrangler secret put VARIABLE_NAME
```

---

## 🧪 Тестирование

### Проверка Worker
```bash
# Через curl
curl https://ваш-worker.workers.dev/rest/v1/

# Через браузер
# Откройте: https://ваш-worker.workers.dev/rest/v1/
```

### Ожидаемый результат
Должен вернуться JSON от Supabase:
```json
{
  "message": "OK"
}
```

---

## 🐛 Отладка

### Просмотр логов
```bash
wrangler tail
```

### Просмотр ошибок
```bash
wrangler tail --format pretty
```

### Локальная разработка
```bash
wrangler dev

# Теперь Worker доступен по адресу:
# http://localhost:8787
```

---

## 📂 Структура проекта

```
cloudflare-worker/
├── src/
│   └── index.js        # Основной код Worker (для CLI)
├── package.json        # Зависимости
└── wrangler.toml       # Конфигурация
```

---

## ❓ Решение проблем

### "command not found: wrangler"
```bash
npm install -g wrangler
```

### "Error: Not authenticated"
```bash
wrangler login
```

### "Error: requested path is invalid" (в Dashboard)
Используйте файл `CLOUDFLARE_DASHBOARD_SIMPLE.js` вместо старого

### CORS ошибки
Убедитесь что в коде есть заголовки CORS (уже включены)

### Worker не деплоится
```bash
# Проверьте конфигурацию
cat wrangler.toml

# Проверьте авторизацию
wrangler whoami
```

---

## 🔗 Полезные ссылки

- **Dashboard**: https://dash.cloudflare.com/
- **Документация Wrangler**: https://developers.cloudflare.com/workers/wrangler/
- **Документация Workers**: https://developers.cloudflare.com/workers/

---

## 📌 После деплоя

1. Скопируйте URL вашего Worker
2. Создайте файл `.env.production` в корне проекта:
   ```env
   VITE_SUPABASE_PROXY_URL=https://ваш-worker.workers.dev
   ```
3. Пересоберите приложение:
   ```bash
   npm run build
   ```

✅ Готово! Приложение будет работать через Worker.
