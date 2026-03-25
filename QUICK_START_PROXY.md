# 🚀 Быстрый старт Cloudflare Worker

## За 5 минут настроите доступ к приложению без VPN

### 1️⃣ Установите Wrangler
```bash
npm install -g wrangler
```

### 2️⃣ Авторизуйтесь в Cloudflare
```bash
wrangler login
```
Зарегистрируйтесь на Cloudflare если ещё нет аккаунта (бесплатно).

### 3️⃣ Разверните Worker
```bash
cd cloudflare-worker
npm install
npm run deploy:production
```

Скопируйте URL который получите, например:
```
https://submanager-supabase-proxy.ваш-поддомен.workers.dev
```

### 4️⃣ Настройте приложение
Создайте `.env.production` в корне проекта:
```env
VITE_SUPABASE_PROXY_URL=https://submanager-supabase-proxy.ваш-поддомен.workers.dev
```

### 5️⃣ Пересоберите приложение
```bash
cd ..
npm run build
```

### 6️⃣ Задеплойте на хостинг
Загрузите содержимое папки `dist` на ваш хостинг.

## ✅ Готово!

Теперь приложение работает без VPN в России.

---

**Подробная документация:** [CLOUDFLARE_SETUP.md](./CLOUDFLARE_SETUP.md)

**Проблемы?** Проверьте логи: `cd cloudflare-worker && npx wrangler tail`
