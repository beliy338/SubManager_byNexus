-- =====================================================
-- 🚩 ФИНАЛЬНЫЙ СКРИПТ УСТАНОВКИ ФЛАГОВ СТРАН
-- =====================================================
-- Дата: 25 марта 2026
-- Версия: 1.0
-- Описание: Полная установка таблицы с 6 флагами стран
-- =====================================================

-- =====================================================
-- ШАГ 1: Создание вспомогательной функции
-- =====================================================
-- Эта функция автоматически обновляет поле updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ШАГ 2: Создание таблицы country_flags
-- =====================================================
CREATE TABLE IF NOT EXISTS country_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL UNIQUE, -- Код страны: RU, GB, BY, CN, ES, FR
  language_code TEXT NOT NULL,       -- Код языка: ru, en, be, zh, es, fr
  flag_url TEXT NOT NULL,            -- Публичный URL флага
  flag_emoji TEXT,                   -- Эмодзи флага: 🇷🇺 🇬🇧 и т.д.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Сообщение в консоль
DO $$
BEGIN
  RAISE NOTICE '✅ Таблица country_flags создана';
END
$$;

-- =====================================================
-- ШАГ 3: Настройка Row Level Security (RLS)
-- =====================================================
ALTER TABLE country_flags ENABLE ROW LEVEL SECURITY;

-- Политика: Все пользователи могут читать флаги
DROP POLICY IF EXISTS "Anyone can view country flags" ON country_flags;
CREATE POLICY "Anyone can view country flags"
  ON country_flags FOR SELECT
  USING (true);

-- Политика: Только владельцы могут добавлять флаги
DROP POLICY IF EXISTS "Owners can insert country flags" ON country_flags;
CREATE POLICY "Owners can insert country flags"
  ON country_flags FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE email IN ('max.sokolvp@gmail.com', 'belovodvadim@gmail.com')
    )
  );

-- Политика: Только владельцы могут обновлять флаги
DROP POLICY IF EXISTS "Owners can update country flags" ON country_flags;
CREATE POLICY "Owners can update country flags"
  ON country_flags FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE email IN ('max.sokolvp@gmail.com', 'belovodvadim@gmail.com')
    )
  );

-- Политика: Только владельцы могут удалять флаги
DROP POLICY IF EXISTS "Owners can delete country flags" ON country_flags;
CREATE POLICY "Owners can delete country flags"
  ON country_flags FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE email IN ('max.sokolvp@gmail.com', 'belovodvadim@gmail.com')
    )
  );

DO $$
BEGIN
  RAISE NOTICE '✅ Политики безопасности настроены';
END
$$;

-- =====================================================
-- ШАГ 4: Создание индексов для быстрого поиска
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_country_flags_language_code 
  ON country_flags(language_code);

CREATE INDEX IF NOT EXISTS idx_country_flags_country_code 
  ON country_flags(country_code);

DO $$
BEGIN
  RAISE NOTICE '✅ Индексы созданы';
END
$$;

-- =====================================================
-- ШАГ 5: Создание триггера для updated_at
-- =====================================================
DROP TRIGGER IF EXISTS update_country_flags_updated_at ON country_flags;
CREATE TRIGGER update_country_flags_updated_at
  BEFORE UPDATE ON country_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DO $$
BEGIN
  RAISE NOTICE '✅ Триггер создан';
END
$$;

-- =====================================================
-- ШАГ 6: ВСТАВКА 6 ФЛАГОВ СТРАН
-- =====================================================
-- Используем Flagcdn - надёжный бесплатный CDN
-- Альтернативы: FlagsAPI, CountryFlagsAPI (см. alternative-flags-urls.sql)

INSERT INTO country_flags (country_code, language_code, flag_url, flag_emoji) VALUES
  ('RU', 'ru', 'https://flagcdn.com/w320/ru.png', '🇷🇺'),
  ('GB', 'en', 'https://flagcdn.com/w320/gb.png', '🇬🇧'),
  ('BY', 'be', 'https://flagcdn.com/w320/by.png', '🇧🇾'),
  ('CN', 'zh', 'https://flagcdn.com/w320/cn.png', '🇨🇳'),
  ('ES', 'es', 'https://flagcdn.com/w320/es.png', '🇪🇸'),
  ('FR', 'fr', 'https://flagcdn.com/w320/fr.png', '🇫🇷')
ON CONFLICT (country_code) DO UPDATE SET
  flag_url = EXCLUDED.flag_url,
  flag_emoji = EXCLUDED.flag_emoji,
  language_code = EXCLUDED.language_code,
  updated_at = NOW();

DO $$
BEGIN
  RAISE NOTICE '✅ 6 флагов добавлено в базу данных';
END
$$;

-- =====================================================
-- ШАГ 7: ПРОВЕРКА УСТАНОВКИ
-- =====================================================
-- Показываем все флаги
SELECT 
  '📊 ПРОВЕРКА УСТАНОВКИ' as info,
  country_code,
  language_code,
  flag_emoji,
  CASE 
    WHEN flag_url LIKE '%flagcdn.com%' THEN '✅ Flagcdn'
    ELSE '⚠️  Other CDN'
  END as cdn_source,
  created_at
FROM country_flags
ORDER BY language_code;

-- Подсчитываем количество
DO $$
DECLARE
  flag_count INT;
BEGIN
  SELECT COUNT(*) INTO flag_count FROM country_flags;
  
  IF flag_count = 6 THEN
    RAISE NOTICE '🎉 УСТАНОВКА ЗАВЕРШЕНА УСПЕШНО! Добавлено 6 флагов.';
  ELSE
    RAISE NOTICE '⚠️  ВНИМАНИЕ: Ожидалось 6 флагов, но найдено %', flag_count;
  END IF;
END
$$;

-- =====================================================
-- 🎯 СЛЕДУЮЩИЕ ШАГИ
-- =====================================================
-- 1. ✅ Проверьте что SQL выполнился без ошибок
-- 2. ✅ Откройте ваш сайт и проверьте переключатель языка
-- 3. ✅ Флаги должны загружаться из базы данных
-- 4. 🔧 Для отладки: откройте Settings (только для владельцев)
-- 5. 🌍 Если в России: используйте alternative-flags-urls.sql
-- =====================================================

-- =====================================================
-- 📚 ПОЛЕЗНЫЕ ЗАПРОСЫ
-- =====================================================

-- Посмотреть все флаги:
-- SELECT * FROM country_flags ORDER BY language_code;

-- Обновить конкретный флаг:
-- UPDATE country_flags 
-- SET flag_url = 'https://новый-url.png' 
-- WHERE country_code = 'RU';

-- Добавить новый флаг:
-- INSERT INTO country_flags (country_code, language_code, flag_url, flag_emoji)
-- VALUES ('DE', 'de', 'https://flagcdn.com/w320/de.png', '🇩🇪');

-- Удалить флаг:
-- DELETE FROM country_flags WHERE country_code = 'ES';

-- =====================================================
-- ✨ ГОТОВО!
-- =====================================================
