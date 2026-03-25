# 📧 Система умных уведомлений SubManager

## ✅ Что реализовано

### 1. Email-уведомления на почту пользователя

**Три типа уведомлений:**

#### 📅 Напоминания о предстоящем списании
- Отправляются за 1-7 дней до оплаты (настраивается пользователем)
- Содержат информацию: название подписки, сумма, дата списания
- Автоматическая проверка каждый день через Cron Job

#### ⚙️ Изменения в сервисах
- Уведомление когда владелец меняет цены или тарифы
- Срабатывает автоматически через триггер базы данных
- Отправляется всем пользователям с этой подпиской

#### 🚫 Прекращение работы сервиса
- Уведомление когда сервис удаляется из каталога
- Информирует о необходимости найти альтернативу
- Подписки пользователей автоматически удаляются

### 2. Интерфейс настроек уведомлений

**Компонент `NotificationSettings` в профиле:**
- ✅ Включение/выключение каждого типа уведомлений
- ✅ Настройка за сколько дней напоминать о списании (1-7 дней)
- ✅ Красивый UI с переключателями
- ✅ Автоматическое сохранение в базу данных

### 3. Прокрутка в чате поддержки

**Исправлено:**
- ✅ Добавлен компонент `ScrollArea` от Radix UI
- ✅ Прокрутка работает как для обычных пользователей, так и для владельцев
- ✅ Автоматическая прокрутка к новым сообщениям
- ✅ Визуальные индикаторы прокрутки

## 📁 Созданные файлы

### SQL и база данных
```
supabase-notifications-system.sql         - Таблицы, триггеры, функции
```

### Edge Functions
```
supabase/functions/send-notifications/index.ts    - Отправка email через Resend
```

### React компоненты
```
src/app/components/NotificationSettings.tsx       - Настройки уведомлений
```

### Документация
```
SETUP-NOTIFICATIONS.md           - Полная инструкция по настройке
NOTIFICATIONS-QUICK-START.md     - Быстрый старт (5 минут)
SMART-NOTIFICATIONS-README.md    - Этот файл
```

## 🗄️ Структура базы данных

### Таблица `notification_settings`
```sql
id                              UUID PRIMARY KEY
user_id                         UUID UNIQUE
email                           TEXT
notify_before_payment           BOOLEAN (default: true)
notify_days_before              INTEGER (default: 1)
notify_service_changes          BOOLEAN (default: true)
notify_service_discontinued     BOOLEAN (default: true)
created_at                      TIMESTAMP
updated_at                      TIMESTAMP
```

### Таблица `notification_logs`
```sql
id                    UUID PRIMARY KEY
user_id               UUID
subscription_id       UUID
service_id            UUID
notification_type     TEXT ('payment_reminder', 'service_changed', 'service_discontinued')
email                 TEXT
subject               TEXT
sent_at               TIMESTAMP
metadata              JSONB
```

## 🔧 Технологии

- **Supabase Database** - хранение настроек и логов
- **Supabase Edge Functions** - серверные функции для отправки email
- **Resend API** - сервис для отправки email (3000 писем/месяц бесплатно)
- **pg_cron** - планировщик задач в PostgreSQL
- **React + Tailwind** - UI для настроек

## 🎯 Как использовать

### Для пользователей

1. Откройте **Профиль** в приложении
2. Прокрутите вниз до секции "Уведомления на почту"
3. Настройте нужные типы уведомлений
4. Нажмите "Сохранить настройки"

### Для разработчиков

1. Следуйте инструкции в `NOTIFICATIONS-QUICK-START.md`
2. Выполните SQL скрипт в Supabase
3. Разверните Edge Function
4. Настройте Cron Job для ежедневных проверок

## 🎨 Email шаблоны

Все email имеют:
- 🌈 Брендированный дизайн с градиентом SubManager
- 📱 Адаптивная верстка для мобильных
- 🔗 Кнопка для перехода в приложение
- 📊 Детальная информация о подписке

## 🔐 Безопасность

- ✅ Row Level Security (RLS) для доступа к настройкам
- ✅ Пользователи видят только свои уведомления
- ✅ Владельцы видят все логи
- ✅ API ключи хранятся в Supabase Secrets

## 📊 Мониторинг

### Просмотр отправленных уведомлений
```sql
SELECT
  nl.*,
  u.email as user_email
FROM notification_logs nl
LEFT JOIN auth.users u ON nl.user_id = u.id
ORDER BY nl.sent_at DESC
LIMIT 20;
```

### Статистика по типам
```sql
SELECT
  notification_type,
  COUNT(*) as total,
  COUNT(DISTINCT user_id) as unique_users
FROM notification_logs
WHERE sent_at >= NOW() - INTERVAL '30 days'
GROUP BY notification_type;
```

### Пользователи с отключенными уведомлениями
```sql
SELECT
  email,
  notify_before_payment,
  notify_service_changes,
  notify_service_discontinued
FROM notification_settings
WHERE NOT (notify_before_payment AND notify_service_changes AND notify_service_discontinued);
```

## 🚀 Развертывание

### Development
```bash
# Локальное тестирование
supabase functions serve send-notifications

# Отправка тестового уведомления
curl http://localhost:54321/functions/v1/send-notifications/check-payment-reminders
```

### Production
```bash
# Развертывание
supabase functions deploy send-notifications

# Настройка секретов
supabase secrets set RESEND_API_KEY=re_ваш_ключ

# Проверка логов
supabase functions logs send-notifications --tail
```

## 💰 Стоимость

### Resend
- **Free:** 3,000 писем/месяц, 100 писем/день
- **Pro:** $20/мес за 50,000 писем

### Supabase
- **Free tier включает:**
  - 500,000 вызовов Edge Functions/месяц
  - pg_cron для планировщика
  - 500 MB базы данных

## 🐛 Отладка

### Проверка Cron Job
```sql
-- Список всех заданий
SELECT * FROM cron.job;

-- История выполнения
SELECT * FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 10;
```

### Тестирование триггеров
```sql
-- Обновить сервис для теста
UPDATE services
SET pricing_plans = '[{"name": "Test", "price": 100}]'::jsonb
WHERE id = 'some-service-id';

-- Проверить созданные уведомления
SELECT * FROM notification_logs
WHERE notification_type = 'service_changed'
ORDER BY created_at DESC;
```

## 📝 TODO (будущие улучшения)

- [ ] Push-уведомления для мобильных приложений
- [ ] Telegram уведомления через Bot API
- [ ] SMS уведомления (через Twilio)
- [ ] Статистика доставки в админ-панели
- [ ] A/B тестирование email шаблонов
- [ ] Персонализация времени отправки
- [ ] Мультиязычные шаблоны
- [ ] Уведомления в Slack для владельцев

## 👥 Авторы

Создано для SubManager
- Владельцы: max.sokolvp@gmail.com, belovodvadim@gmail.com

## 📄 Лицензия

Часть проекта SubManager
