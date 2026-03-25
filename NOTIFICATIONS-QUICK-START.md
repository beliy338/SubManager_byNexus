# 🚀 Быстрый старт: Умные уведомления

## Минимальная настройка (5 минут)

### 1. Создайте таблицы в Supabase
```bash
# Выполните в Supabase Dashboard → SQL Editor
supabase-notifications-system.sql
```

### 2. Зарегистрируйтесь в Resend
1. Перейдите на [resend.com](https://resend.com)
2. Создайте аккаунт (3000 писем/месяц бесплатно)
3. Получите API ключ

### 3. Разверните Edge Function
```bash
# Установите Supabase CLI
brew install supabase/tap/supabase  # или scoop install supabase

# Войдите и подключитесь к проекту
supabase login
supabase link --project-ref your-project-ref

# Добавьте API ключ
supabase secrets set RESEND_API_KEY=re_ваш_ключ

# Разверните функцию
supabase functions deploy send-notifications
```

### 4. Настройте Cron Job
```sql
-- Выполните в Supabase Dashboard → SQL Editor
SELECT cron.schedule(
  'send-payment-reminders',
  '0 9 * * *',  -- Каждый день в 9:00 UTC (12:00 МСК)
  $$
  SELECT net.http_post(
    url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-notifications/check-payment-reminders',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
    body:='{}'::jsonb
  ) AS request_id;
  $$
);
```

### 5. Проверьте работу
```bash
# Протестируйте отправку вручную
curl -X POST \
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-notifications/check-payment-reminders' \
  -H 'Authorization: Bearer YOUR_ANON_KEY'
```

## Готово! ✅

Теперь пользователи будут получать:
- 📧 Напоминания о списании за 1 день
- 📧 Уведомления об изменениях в сервисах
- 📧 Уведомления о прекращении работы сервисов

Настройки доступны в **Профиле** → "Уведомления на почту"

## Что дальше?

- 📖 Подробная документация: `SETUP-NOTIFICATIONS.md`
- 🔧 Настройка шаблонов email: `supabase/functions/send-notifications/index.ts`
- 📊 Просмотр логов: `SELECT * FROM notification_logs;`
