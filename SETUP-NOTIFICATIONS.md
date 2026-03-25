# 📧 Настройка системы умных уведомлений SubManager

## Обзор системы

Система умных уведомлений отправляет email-уведомления пользователям о:
1. **Предстоящих списаниях** - за 1-7 дней до оплаты
2. **Изменениях в сервисах** - когда владельцы меняют цены или тарифы
3. **Прекращении работы сервисов** - когда сервис удаляется из каталога

## Шаг 1: Создание таблиц в Supabase

### 1.1 Выполните SQL скрипт

1. Откройте **Supabase Dashboard** → SQL Editor
2. Выполните файл **`supabase-notifications-system.sql`**

Этот скрипт создаст:
- ✅ Таблицу `notification_settings` для настроек пользователя
- ✅ Таблицу `notification_logs` для истории отправленных уведомлений
- ✅ Функции для получения списка уведомлений
- ✅ Триггеры для отслеживания изменений в сервисах
- ✅ RLS политики для безопасного доступа

### 1.2 Проверьте создание

Выполните в SQL Editor:
```sql
-- Проверить таблицы
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('notification_settings', 'notification_logs');

-- Проверить функции
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%notification%';
```

## Шаг 2: Настройка Resend для отправки email

### 2.1 Создайте аккаунт в Resend

1. Перейдите на [resend.com](https://resend.com)
2. Зарегистрируйтесь (бесплатный тариф: 3000 писем/месяц)
3. Подтвердите email

### 2.2 Получите API ключ

1. В Resend Dashboard → API Keys
2. Создайте новый API key с именем "SubManager Notifications"
3. Скопируйте ключ (начинается с `re_...`)

### 2.3 Добавьте домен (опционально, для production)

Для тестирования можно использовать домен `onboarding@resend.dev`.

Для production:
1. В Resend Dashboard → Domains
2. Добавьте ваш домен (например, `submanager.app`)
3. Настройте DNS записи
4. Дождитесь верификации

## Шаг 3: Развертывание Edge Function

### 3.1 Установите Supabase CLI

```bash
# macOS/Linux
brew install supabase/tap/supabase

# Windows
scoop install supabase
```

### 3.2 Инициализируйте проект

```bash
cd /путь/к/submanager
supabase login
supabase link --project-ref your-project-ref
```

### 3.3 Добавьте секреты

```bash
# Добавьте Resend API key
supabase secrets set RESEND_API_KEY=re_ваш_ключ

# Проверьте секреты
supabase secrets list
```

### 3.4 Разверните функцию

```bash
supabase functions deploy send-notifications
```

Проверьте в Supabase Dashboard → Edge Functions.

## Шаг 4: Настройка Cron Job для ежедневных уведомлений

### Вариант A: Supabase Cron (рекомендуется)

1. Откройте **Supabase Dashboard** → Database → Cron Jobs (pg_cron)
2. Создайте новый cron job:

```sql
-- Проверка уведомлений каждый день в 9:00 UTC
SELECT cron.schedule(
  'send-payment-reminders',
  '0 9 * * *',  -- Каждый день в 9:00 UTC
  $$
  SELECT net.http_post(
    url:='https://your-project-ref.supabase.co/functions/v1/send-notifications/check-payment-reminders',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
    body:='{}'::jsonb
  ) AS request_id;
  $$
);

-- Проверьте созданный cron job
SELECT * FROM cron.job;
```

### Вариант B: GitHub Actions (альтернатива)

Создайте `.github/workflows/notifications.yml`:

```yaml
name: Send Daily Notifications

on:
  schedule:
    # Каждый день в 09:00 UTC
    - cron: '0 9 * * *'
  workflow_dispatch:  # Ручной запуск

jobs:
  send-notifications:
    runs-on: ubuntu-latest
    steps:
      - name: Send Payment Reminders
        run: |
          curl -X POST \
            'https://your-project-ref.supabase.co/functions/v1/send-notifications/check-payment-reminders' \
            -H 'Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}' \
            -H 'Content-Type: application/json'
```

## Шаг 5: Тестирование системы

### 5.1 Проверьте Edge Function вручную

```bash
# Проверка предстоящих платежей
curl -X POST \
  'https://your-project-ref.supabase.co/functions/v1/send-notifications/check-payment-reminders' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json'
```

### 5.2 Создайте тестовую подписку

1. Войдите в приложение
2. Добавьте подписку с датой списания завтра
3. Проверьте настройки уведомлений в профиле
4. Подождите или запустите функцию вручную

### 5.3 Проверьте логи

```sql
-- Проверить отправленные уведомления
SELECT * FROM notification_logs
ORDER BY sent_at DESC
LIMIT 10;

-- Проверить настройки пользователей
SELECT * FROM notification_settings;

-- Проверить предстоящие платежи
SELECT * FROM get_subscriptions_needing_payment_notification();
```

## Шаг 6: Как это работает

### Напоминания о списании (Payment Reminders)

1. **Cron Job** запускается каждый день в 9:00 UTC
2. Функция `get_subscriptions_needing_payment_notification()` находит подписки с предстоящими платежами
3. Edge Function отправляет email через Resend
4. Запись о отправке сохраняется в `notification_logs`

### Изменения в сервисах (Service Changes)

1. Владелец обновляет тарифы сервиса в AdminPanel
2. **Триггер** `service_changes_notification_trigger` срабатывает автоматически
3. Создаются записи в `notification_logs` для всех пользователей с этим сервисом
4. Edge Function отправляет email (запускается отдельно)

### Прекращение работы сервиса (Service Discontinued)

1. Владелец удаляет сервис из AdminPanel
2. **Триггер** `service_discontinued_notification_trigger` срабатывает перед удалением
3. Создаются записи в `notification_logs`
4. Email отправляются пользователям
5. Подписки пользователей удаляются каскадно

## Настройка пользователя

Пользователи могут настроить уведомления в **Профиле** → секция "Уведомления на почту":

- ☑️ Напоминания о списании (за 1-7 дней)
- ☑️ Изменения в сервисах
- ☑️ Прекращение работы сервиса

## Структура email-уведомлений

Все email используют красивые HTML шаблоны с:
- 🎨 Брендированный дизайн SubManager (оранжево-фиолетовый градиент)
- 📱 Адаптивная верстка для мобильных устройств
- 🔗 Кнопка перехода в приложение
- ℹ️ Подробная информация о подписке

## Мониторинг и отладка

### Просмотр логов Edge Function

```bash
supabase functions logs send-notifications --tail
```

### Проверка статуса в Resend Dashboard

1. Откройте [Resend Dashboard](https://resend.com/emails)
2. Просмотрите отправленные письма
3. Проверьте статус доставки

### Частые проблемы

**Проблема:** Письма не отправляются
- ✅ Проверьте RESEND_API_KEY в Supabase secrets
- ✅ Проверьте логи Edge Function
- ✅ Проверьте лимиты Resend (3000 писем/месяц)

**Проблема:** Уведомления дублируются
- ✅ Проверьте таблицу `notification_logs`
- ✅ Убедитесь, что функция `get_subscriptions_needing_payment_notification()` фильтрует уже отправленные

**Проблема:** Триггеры не срабатывают
- ✅ Проверьте, что триггеры созданы: `SELECT * FROM pg_trigger;`
- ✅ Проверьте логи в Supabase Dashboard

## Цены и лимиты

### Resend (бесплатный план)
- ✅ 3,000 писем/месяц
- ✅ 100 писем/день
- ✅ Для большего - от $20/мес за 50,000 писем

### Supabase Edge Functions
- ✅ 500,000 вызовов/месяц (бесплатно)
- ✅ Для большего - автоматический биллинг

### Supabase Cron Jobs
- ✅ Включено в Free tier
- ✅ До 60 заданий

## Безопасность

- 🔒 Все email отправляются с валидацией пользователя
- 🔒 RLS политики защищают доступ к настройкам
- 🔒 API ключи хранятся в Supabase Secrets
- 🔒 Логи уведомлений видны только пользователю и владельцам

## Дополнительные функции (TODO)

Можно добавить в будущем:
- 📱 Push-уведомления (через Firebase)
- 💬 Telegram уведомления (через Bot API)
- 📊 Статистика доставки в админке
- ✉️ Кастомизация шаблонов email
- 🌐 Мультиязычные шаблоны

## Поддержка

Если возникли проблемы:
1. Проверьте логи: `supabase functions logs send-notifications`
2. Проверьте SQL: `SELECT * FROM notification_logs;`
3. Обратитесь к владельцам: max.sokolvp@gmail.com, belovodvadim@gmail.com
