-- =====================================================
-- ПРОВЕРКА ТАБЛИЦЫ ФЛАГОВ СТРАН
-- =====================================================
-- Используйте эти запросы для проверки что всё работает
-- =====================================================

-- 1. Проверить существование таблицы
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_name = 'country_flags';

-- 2. Проверить структуру таблицы
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'country_flags'
ORDER BY ordinal_position;

-- 3. Показать все флаги (должно быть 6 записей)
SELECT 
  country_code,
  language_code,
  flag_emoji,
  flag_url,
  created_at
FROM country_flags
ORDER BY language_code;

-- 4. Проверить политики RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'country_flags';

-- 5. Проверить индексы
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'country_flags';

-- 6. Подсчитать количество флагов
SELECT COUNT(*) as total_flags FROM country_flags;

-- 7. Проверить доступность URL флагов (первые 3)
SELECT 
  country_code,
  language_code,
  CASE 
    WHEN flag_url LIKE 'https://flagcdn.com%' THEN 'Flagcdn CDN'
    ELSE 'Other CDN'
  END as cdn_source
FROM country_flags
LIMIT 3;

-- 8. Проверить что нет дубликатов
SELECT 
  country_code, 
  COUNT(*) as count
FROM country_flags
GROUP BY country_code
HAVING COUNT(*) > 1;

-- 9. Проверить что все обязательные поля заполнены
SELECT 
  country_code,
  language_code,
  CASE 
    WHEN flag_url IS NULL THEN 'MISSING URL'
    WHEN flag_url = '' THEN 'EMPTY URL'
    ELSE 'OK'
  END as url_status
FROM country_flags;

-- 10. Получить последнее обновление
SELECT 
  MAX(updated_at) as last_update,
  MIN(created_at) as first_created
FROM country_flags;
