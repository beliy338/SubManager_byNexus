# Инструкция по применению миграции для уведомлений

## Проблема
При создании уведомлений возникает ошибка:
```
Error creating in-app notification: {
  "code": "23514",
  "message": "new row for relation \"notifications\" violates check constraint \"notifications_type_check\""
}
```

Это происходит потому, что в базе данных не хватает некоторых типов уведомлений в constraint.

## Решение

### Шаг 1: Откройте Supabase Dashboard
1. Перейдите в ваш проект Supabase
2. Откройте раздел **SQL Editor**

### Шаг 2: Выполните миграцию
Скопируйте и выполните SQL-запрос из файла `UPDATE_NOTIFICATIONS_CONSTRAINT.sql`:

```sql
-- Drop the existing constraint
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Add the updated constraint with all notification types
ALTER TABLE notifications 
ADD CONSTRAINT notifications_type_check 
CHECK (type IN (
  'billing_1day', 
  'billing_3day', 
  'subscription_added', 
  'subscription_deleted', 
  'subscription_updated', 
  'profile_updated', 
  'settings_updated', 
  'price_changed'
));

-- Update the comment to reflect all supported types
COMMENT ON COLUMN notifications.type IS 'Type of notification: billing_1day, billing_3day, subscription_added, subscription_deleted, subscription_updated, profile_updated, settings_updated, price_changed';
```

### Шаг 3: Проверка
После выполнения миграции все типы уведомлений должны работать корректно:
- ✅ `billing_1day` - уведомление за 1 день до списания
- ✅ `billing_3day` - уведомление за 3 дня до списания
- ✅ `subscription_added` - добавлена новая подписка
- ✅ `subscription_deleted` - подписка удалена (с кнопкой "Вернуть")
- ✅ `subscription_updated` - подписка обновлена
- ✅ `profile_updated` - профиль обновлен
- ✅ `settings_updated` - настройки изменены
- ✅ `price_changed` - изменена цена подписки

## Альтернативный метод (через Supabase CLI)

Если у вас установлен Supabase CLI, вы можете выполнить:

```bash
supabase db push
```

Или напрямую применить миграцию:

```bash
psql $DATABASE_URL -f UPDATE_NOTIFICATIONS_CONSTRAINT.sql
```

## После миграции

Перезагрузите приложение - все уведомления должны создаваться без ошибок!
