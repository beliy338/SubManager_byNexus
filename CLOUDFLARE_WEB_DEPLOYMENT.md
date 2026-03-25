# 🌐 Развертывание через веб-интерфейс (БЕЗ командной строки)

## Шаг 1: Создайте аккаунт Cloudflare

1. Откройте https://dash.cloudflare.com/sign-up
2. Зарегистрируйтесь (бесплатно)
3. Подтвердите email

## Шаг 2: Создайте Worker

1. Откройте https://dash.cloudflare.com/
2. В левом меню выберите **Workers & Pages**
3. Нажмите **Create application**
4. Нажмите **Create Worker**
5. Дайте имя: `submanager-supabase-proxy`
6. Нажмите **Deploy**

## Шаг 3: Вставьте код Worker

1. После создания Worker нажмите **Edit code** (или **Quick edit**)
2. **УДАЛИТЕ** весь существующий код
3. **СКОПИРУЙТЕ И ВСТАВЬТЕ** код из файла `cloudflare-worker-code.js` (см. ниже)
4. Нажмите **Save and Deploy**

## Шаг 4: Скопируйте URL Worker

После сохранения вы увидите URL вашего Worker, например:
```
https://submanager-supabase-proxy.ваш-поддомен.workers.dev
```

**Скопируйте этот URL!**

## Шаг 5: Настройте приложение

Создайте файл `.env.production` в корне вашего проекта и добавьте:

```env
VITE_SUPABASE_PROXY_URL=https://submanager-supabase-proxy.ваш-поддомен.workers.dev
```

Замените URL на тот, который вы скопировали.

## Шаг 6: Пересоберите приложение

Если у вас есть доступ к командной строке:
```bash
npm run build
```

Если нет - используйте ваш хостинг/деплой платформу для пересборки.

## ✅ Готово!

Теперь приложение работает без VPN!

## Проверка работы

Откройте в браузере:
```
https://submanager-supabase-proxy.ваш-поддомен.workers.dev/rest/v1/
```

Должны увидеть JSON ответ от Supabase.

---

## Код Worker для копирования

Смотрите файл: `cloudflare-worker-code.js`
