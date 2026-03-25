# Настройка базы данных Supabase

## Как применить миграцию

### Вариант 1: Через Supabase Dashboard (Рекомендуется)

1. Откройте ваш проект Supabase: https://echbyusirwoojodjhhzi.supabase.co
2. Перейдите в раздел **SQL Editor** в левом меню
3. Нажмите **New Query**
4. Скопируйте содержимое файла `/supabase/migrations/001_initial_schema.sql`
5. Вставьте в редактор SQL
6. Нажмите **Run** (или Ctrl/Cmd + Enter)

### Вариант 2: Через Supabase CLI

```bash
# Установите Supabase CLI (если еще не установлен)
npm install -g supabase

# Войдите в Supabase
supabase login

# Примените миграцию
supabase db push --db-url "postgresql://postgres:[YOUR-PASSWORD]@db.echbyusirwoojodjhhzi.supabase.co:5432/postgres"
```

## Что создается

### Таблица `subscriptions`
Хранит все подписки пользователей:
- `id` - уникальный идентификатор подписки
- `user_id` - ссылка на пользователя (auth.users)
- `name` - название сервиса
- `category` - категория (музыка, видео и т.д.)
- `price` - стоимость
- `billing_cycle` - цикл оплаты (monthly/yearly)
- `next_billing` - дата следующего списания
- `status` - статус подписки
- `created_at` - дата создания
- `updated_at` - дата последнего обновления

### Таблица `user_settings`
Хранит настройки пользователей:
- `id` - уникальный идентификатор
- `user_id` - ссылка на пользователя (уникальный)
- `language` - язык интерфейса (ru/en/be/zh)
- `currency` - валюта (RUB/USD/EUR/BYN/CNY)
- `font_size` - размер текста (small/medium/large)
- `theme` - тема оформления (dark/light)
- `created_at` - дата создания
- `updated_at` - дата последнего обновления

## Безопасность (Row Level Security)

Созданы политики безопасности, которые гарантируют, что:
- Пользователи видят только свои подписки
- Пользователи могут изменять только свои данные
- Нет доступа к данным других пользователей

## Проверка установки

После применения миграции выполните:

```sql
-- Проверить созданные таблицы
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Проверить политики RLS
SELECT * FROM pg_policies 
WHERE tablename IN ('subscriptions', 'user_settings');
```

## Готово!

После применения миграции приложение автоматически начнет использовать Supabase Database для хранения данных вместо localStorage.
