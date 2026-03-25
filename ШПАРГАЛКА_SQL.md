# 🎯 SQL Шпаргалка для SubManager

## ⚡ Быстрая установка (скопируй и вставь)

### Шаг 1: Открой Supabase
```
https://supabase.com/dashboard/project/echbyusirwoojodjhhzi
```

### Шаг 2: SQL Editor → New Query → Вставь и Run

---

## 📋 Проверочные команды

### 1. Посчитать все сервисы
```sql
SELECT COUNT(*) as total FROM public.services;
```
**Должно быть:** ≥ 12

---

### 2. Группировка по категориям
```sql
SELECT 
  category,
  COUNT(*) as count
FROM public.services
GROUP BY category
ORDER BY count DESC;
```
**Результат:**
```
Развлечения  | 4
Финансы      | 4
Шопинг       | 3-4
```

---

### 3. Список российских сервисов
```sql
SELECT 
  name,
  category,
  icon,
  is_popular
FROM public.services
WHERE category IN ('Финансы', 'Развлечения', 'Шопинг')
ORDER BY category, name;
```

---

### 4. Проверка тарифов
```sql
SELECT 
  name,
  category,
  jsonb_array_length(pricing_plans) as plans_count,
  pricing_plans
FROM public.services
WHERE category IN ('Финансы', 'Развлечения', 'Шопинг')
ORDER BY category, name;
```

---

### 5. Проверка владельца
```sql
SELECT 
  s.name,
  u.email as owner_email
FROM public.services s
JOIN auth.users u ON s.user_id = u.id
WHERE s.category IN ('Финансы', 'Развлечения', 'Шопинг')
ORDER BY s.name;
```
**Должно быть:** max.sokolvp@gmail.com

---

### 6. Поиск конкретного сервиса
```sql
SELECT * 
FROM public.services 
WHERE name LIKE '%Яндекс%';
```

---

### 7. Все сервисы с ценами
```sql
SELECT 
  name,
  category,
  pricing_plans->0->>'price' as first_price,
  pricing_plans->0->>'currency' as currency,
  pricing_plans->0->>'billingCycle' as cycle
FROM public.services
WHERE category IN ('Финансы', 'Развлечения', 'Шопинг')
ORDER BY name;
```

---

## 🗑️ Команды удаления (осторожно!)

### Удалить все российские сервисы
```sql
DELETE FROM public.services
WHERE category IN ('Финансы', 'Развлечения', 'Шопинг');
```
⚠️ **Внимание:** Удалит все сервисы в этих категориях!

---

### Удалить конкретный сервис
```sql
DELETE FROM public.services
WHERE name = 'Яндекс Плюс';
```

---

### Удалить дубликаты
```sql
DELETE FROM public.services a
USING public.services b
WHERE a.id < b.id
AND a.name = b.name;
```

---

## 🔧 Команды обновления

### Обновить цену сервиса
```sql
UPDATE public.services
SET pricing_plans = '[
  {
    "name": "Месяц",
    "price": 499,
    "currency": "RUB",
    "billingCycle": "monthly",
    "features": ["Новая цена"]
  }
]'::jsonb
WHERE name = 'Яндекс Плюс';
```

---

### Сделать сервис популярным
```sql
UPDATE public.services
SET is_popular = true
WHERE name = 'Яндекс Плюс';
```

---

### Изменить категорию
```sql
UPDATE public.services
SET category = 'Развлечения'
WHERE name = 'Яндекс Плюс';
```

---

## 📊 Аналитические запросы

### Средняя цена по категориям
```sql
SELECT 
  category,
  AVG((pricing_plans->0->>'price')::numeric) as avg_price
FROM public.services
WHERE category IN ('Финансы', 'Развлечения', 'Шопинг')
GROUP BY category
ORDER BY avg_price DESC;
```

---

### Самые дорогие сервисы
```sql
SELECT 
  name,
  category,
  (pricing_plans->0->>'price')::numeric as price
FROM public.services
WHERE category IN ('Финансы', 'Развлечения', 'Шопинг')
ORDER BY price DESC
LIMIT 5;
```

---

### Самые дешёвые сервисы
```sql
SELECT 
  name,
  category,
  (pricing_plans->0->>'price')::numeric as price
FROM public.services
WHERE category IN ('Финансы', 'Развлечения', 'Шопинг')
ORDER BY price ASC
LIMIT 5;
```

---

### Сервисы с несколькими тарифами
```sql
SELECT 
  name,
  category,
  jsonb_array_length(pricing_plans) as plans_count
FROM public.services
WHERE jsonb_array_length(pricing_plans) > 1
ORDER BY plans_count DESC;
```

---

## 🔍 Диагностические запросы

### Проверка структуры таблицы
```sql
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'services'
ORDER BY ordinal_position;
```

---

### Проверка индексов
```sql
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'services';
```

---

### Проверка RLS политик
```sql
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'services';
```

---

## 🚨 Решение проблем

### Сервисы не видны в приложении?
```sql
-- Проверка прав доступа
SELECT 
  user_id,
  COUNT(*) as services_count
FROM public.services
GROUP BY user_id;
```

---

### Проверка duplicates
```sql
SELECT 
  name,
  COUNT(*) as count
FROM public.services
GROUP BY name
HAVING COUNT(*) > 1;
```

---

### Проверка пустых pricing_plans
```sql
SELECT 
  name,
  category,
  pricing_plans
FROM public.services
WHERE pricing_plans = '[]'::jsonb
OR pricing_plans IS NULL;
```

---

### Проверка валюты
```sql
SELECT DISTINCT
  pricing_plans->0->>'currency' as currency,
  COUNT(*) as count
FROM public.services
GROUP BY currency;
```
**Должно быть:** RUB

---

## 📝 Полезные заметки

### Формат pricing_plans
```jsonb
[
  {
    "name": "Месяц",
    "price": 449,
    "currency": "RUB",
    "billingCycle": "monthly",
    "features": ["Функция 1", "Функция 2"]
  },
  {
    "name": "Год",
    "price": 3490,
    "currency": "RUB",
    "billingCycle": "yearly",
    "features": ["Функция 1", "Выгода"]
  }
]
```

---

### billingCycle значения
- `monthly` — ежемесячно
- `yearly` — ежегодно
- `weekly` — еженедельно (не используется)
- `quarterly` — ежеквартально (не используется)

---

### Популярные категории
- Финансы
- Развлечения
- Шопинг
- Кино и сериалы
- Музыка
- Здоровье
- Интернет и телеком
- Образование

---

## 🎯 Быстрые проверки

### Всё ли на месте?
```sql
SELECT 
  'Сервисов всего' as metric,
  COUNT(*)::text as value
FROM public.services

UNION ALL

SELECT 
  'Категория: Финансы',
  COUNT(*)::text
FROM public.services
WHERE category = 'Финансы'

UNION ALL

SELECT 
  'Категория: Развлечения',
  COUNT(*)::text
FROM public.services
WHERE category = 'Развлечения'

UNION ALL

SELECT 
  'Категория: Шопинг',
  COUNT(*)::text
FROM public.services
WHERE category = 'Шопинг'

UNION ALL

SELECT 
  'Популярных сервисов',
  COUNT(*)::text
FROM public.services
WHERE is_popular = true;
```

**Результат должен быть:**
```
Сервисов всего          | 12+
Категория: Финансы      | 4
Категория: Развлечения  | 4
Категория: Шопинг       | 3-4
Популярных сервисов     | 12
```

---

## 🔐 Проверка безопасности

### Проверка Row Level Security
```sql
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'services';
```
**rowsecurity должно быть:** true

---

### Кто может читать?
```sql
SELECT 
  policyname,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'services'
AND cmd = 'SELECT';
```

---

### Кто может создавать?
```sql
SELECT 
  policyname,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'services'
AND cmd = 'INSERT';
```

---

## 💡 Полезные трюки

### Экспорт в JSON
```sql
SELECT json_agg(row_to_json(t))
FROM (
  SELECT name, category, pricing_plans
  FROM public.services
  WHERE category IN ('Финансы', 'Развлечения', 'Шопинг')
) t;
```

---

### Красивый вывод цен
```sql
SELECT 
  name,
  category,
  CONCAT(
    pricing_plans->0->>'price',
    ' ',
    pricing_plans->0->>'currency',
    '/',
    CASE 
      WHEN pricing_plans->0->>'billingCycle' = 'monthly' THEN 'мес'
      WHEN pricing_plans->0->>'billingCycle' = 'yearly' THEN 'год'
    END
  ) as price_formatted
FROM public.services
WHERE category IN ('Финансы', 'Развлечения', 'Шопинг')
ORDER BY name;
```

---

### Поиск по описанию
```sql
SELECT 
  name,
  category,
  description
FROM public.services
WHERE description ILIKE '%кэшбэк%'
ORDER BY name;
```

---

## 📞 Контакты для вопросов

**Владельцы:**
- max.sokolvp@gmail.com
- belovodvadim@gmail.com

**Supabase Project:**
- ID: echbyusirwoojodjhhzi
- URL: https://supabase.com/dashboard/project/echbyusirwoojodjhhzi

---

## 🎓 Дополнительные ресурсы

- [Supabase SQL Docs](https://supabase.com/docs/guides/database)
- [PostgreSQL JSON Functions](https://www.postgresql.org/docs/current/functions-json.html)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

**Версия:** 1.0  
**Дата:** 15 марта 2026  
**Статус:** ✅ Готово

---

💾 **Сохрани эту шпаргалку!** Она всегда пригодится.
