-- =====================================================
-- БЫСТРАЯ ПРОВЕРКА ТАБЛИЦЫ ФЛАГОВ СТРАН
-- =====================================================
-- Скопируйте и выполните эти запросы в SQL Editor
-- чтобы убедиться что всё работает правильно
-- =====================================================

-- ✅ ПРОВЕРКА 1: Таблица существует?
-- =====================================================
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'country_flags'
) AS table_exists;
-- Результат должен быть: true

-- ✅ ПРОВЕРКА 2: Сколько записей в таблице?
-- =====================================================
SELECT COUNT(*) AS total_flags FROM country_flags;
-- Результат должен быть: 4

-- ✅ ПРОВЕРКА 3: Все флаги на месте?
-- =====================================================
SELECT 
  country_code AS "Код страны",
  language_code AS "Язык",
  flag_emoji AS "Эмодзи",
  CASE 
    WHEN LENGTH(flag_url) > 50 
    THEN LEFT(flag_url, 47) || '...'
    ELSE flag_url 
  END AS "URL"
FROM country_flags
ORDER BY language_code;
-- Должно вернуть 4 записи: RU, GB, BY, CN

-- ✅ ПРОВЕРКА 4: RLS политики настроены?
-- =====================================================
SELECT 
  policyname AS "Название политики",
  cmd AS "Команда",
  qual AS "Условие"
FROM pg_policies 
WHERE tablename = 'country_flags';
-- Должно показать 3 политики: SELECT, INSERT, UPDATE

-- ✅ ПРОВЕРКА 5: Индексы созданы?
-- =====================================================
SELECT 
  indexname AS "Название индекса",
  indexdef AS "Определение"
FROM pg_indexes 
WHERE tablename = 'country_flags';
-- Должно показать 2-3 индекса

-- ✅ ПРОВЕРКА 6: Триггер создан?
-- =====================================================
SELECT 
  trigger_name AS "Триггер",
  event_manipulation AS "Событие"
FROM information_schema.triggers 
WHERE event_object_table = 'country_flags';
-- Должен показать триггер update_country_flags_updated_at

-- =====================================================
-- ДОПОЛНИТЕЛЬНЫЕ ПОЛЕЗНЫЕ ЗАПРОСЫ
-- =====================================================

-- 📊 Полная информация о флагах
-- =====================================================
SELECT 
  id,
  country_code,
  language_code,
  flag_url,
  flag_emoji,
  created_at,
  updated_at
FROM country_flags
ORDER BY language_code;

-- 🔍 Проверка доступности URL флагов
-- =====================================================
-- (Этот запрос покажет только данные, 
--  реальную доступность нужно проверять вручную)
SELECT 
  country_code,
  flag_url,
  CASE 
    WHEN flag_url LIKE 'https://flagcdn.com%' THEN '✅ Flagpedia CDN'
    WHEN flag_url LIKE 'https://countryflagsapi.com%' THEN '✅ Country Flags API'
    WHEN flag_url LIKE 'https://flagsapi.com%' THEN '✅ Flags API'
    ELSE '⚠️ Неизвестный CDN'
  END AS "Источник"
FROM country_flags;

-- 🔒 Проверка Row Level Security
-- =====================================================
SELECT 
  schemaname,
  tablename,
  rowsecurity AS "RLS включен?"
FROM pg_tables 
WHERE tablename = 'country_flags';
-- RLS должен быть = true

-- 📈 Статистика таблицы
-- =====================================================
SELECT 
  schemaname AS "Схема",
  tablename AS "Таблица",
  n_tup_ins AS "Вставлено строк",
  n_tup_upd AS "Обновлено строк",
  n_tup_del AS "Удалено строк"
FROM pg_stat_user_tables 
WHERE tablename = 'country_flags';

-- =====================================================
-- ТЕСТИРОВАНИЕ ДОСТУПА
-- =====================================================

-- 🧪 Тест 1: Анонимный пользователь может читать?
-- =====================================================
SET ROLE anon;
SELECT COUNT(*) AS accessible_flags FROM country_flags;
-- Должно вернуть: 4
RESET ROLE;

-- 🧪 Тест 2: Можно ли получить конкретный флаг?
-- =====================================================
SELECT * FROM country_flags WHERE language_code = 'ru';
-- Должен вернуть флаг России

-- 🧪 Тест 3: URL флагов корректны?
-- =====================================================
SELECT 
  country_code,
  CASE 
    WHEN flag_url ~ '^https://' THEN '✅ HTTPS'
    WHEN flag_url ~ '^http://' THEN '⚠️ HTTP (небезопасно)'
    ELSE '❌ Некорректный URL'
  END AS "Безопасность"
FROM country_flags;
-- Все должны быть HTTPS

-- =====================================================
-- ДИАГНОСТИКА ПРОБЛЕМ
-- =====================================================

-- ❓ Проблема: Таблица не найдена
-- Решение: Выполните /supabase-country-flags-table.sql
-- =====================================================

-- ❓ Проблема: Нет записей в таблице
-- Решение: Выполните INSERT запросы из основного SQL файла
-- =====================================================

-- ❓ Проблема: RLS блокирует доступ
-- Решение: Проверьте политики
-- =====================================================
SELECT * FROM pg_policies WHERE tablename = 'country_flags';

-- ❓ Проблема: Старые URL флагов
-- Решение: Обновите URL
-- =====================================================
-- Пример обновления:
-- UPDATE country_flags 
-- SET flag_url = 'https://flagcdn.com/w320/ru.png' 
-- WHERE country_code = 'RU';

-- =====================================================
-- СБРОС И ПЕРЕСОЗДАНИЕ (ИСПОЛЬЗУЙТЕ ОСТОРОЖНО!)
-- =====================================================
-- ⚠️ Эти команды удалят таблицу и все данные!
-- ⚠️ Используйте только если нужно начать заново!
-- =====================================================

/*
-- УДАЛЕНИЕ ТАБЛИЦЫ (раскомментируйте для использования)
DROP TABLE IF EXISTS country_flags CASCADE;

-- После удаления выполните основной SQL скрипт:
-- /supabase-country-flags-table.sql
*/

-- =====================================================
-- ЭКСПОРТ ДАННЫХ ДЛЯ РЕЗЕРВНОГО КОПИРОВАНИЯ
-- =====================================================
-- Скопируйте результат этого запроса для бэкапа
-- =====================================================
SELECT 
  'INSERT INTO country_flags (country_code, language_code, flag_url, flag_emoji) VALUES' || 
  string_agg(
    format(
      '(%L, %L, %L, %L)', 
      country_code, 
      language_code, 
      flag_url, 
      flag_emoji
    ),
    ', '
  ) || ';' AS backup_sql
FROM country_flags;

-- =====================================================
-- БЫСТРАЯ СПРАВКА
-- =====================================================
-- Таблица: country_flags
-- Записи: 4 (RU, GB, BY, CN)
-- CDN: https://flagcdn.com
-- RLS: Включен (чтение - все, запись - владельцы)
-- Индексы: language_code, country_code
-- Триггер: update_updated_at_column
-- =====================================================

-- ✅ Если все проверки прошли успешно - всё работает!
-- 📖 Полная документация: /COUNTRY_FLAGS_README.md
-- ✅ Чеклист: /CHECKLIST_COUNTRY_FLAGS.md
-- =====================================================
