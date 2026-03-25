-- =====================================================
-- ТАБЛИЦА ДЛЯ ХРАНЕНИЯ ФЛАГОВ СТРАН
-- =====================================================
-- Создание: 25 марта 2026
-- Описание: Хранит публичные URL флагов для языков приложения
-- =====================================================

-- Создаем таблицу для флагов стран
CREATE TABLE IF NOT EXISTS country_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL UNIQUE, -- ISO 3166-1 alpha-2 код страны
  language_code TEXT NOT NULL, -- Код языка (ru, en, be, zh)
  flag_url TEXT NOT NULL, -- Публичный URL флага
  flag_emoji TEXT, -- Unicode эмодзи флага (опционально)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Включаем Row Level Security
ALTER TABLE country_flags ENABLE ROW LEVEL SECURITY;

-- Политики доступа (только чтение для всех, включая анонимных)
CREATE POLICY "Anyone can view country flags"
  ON country_flags FOR SELECT
  USING (true);

-- Только владельцы могут вставлять/обновлять флаги
CREATE POLICY "Owners can insert country flags"
  ON country_flags FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE email IN ('max.sokolvp@gmail.com', 'belovodvadim@gmail.com')
    )
  );

CREATE POLICY "Owners can update country flags"
  ON country_flags FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE email IN ('max.sokolvp@gmail.com', 'belovodvadim@gmail.com')
    )
  );

-- Создаем индекс для быстрого поиска
CREATE INDEX idx_country_flags_language_code ON country_flags(language_code);
CREATE INDEX idx_country_flags_country_code ON country_flags(country_code);

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_country_flags_updated_at
  BEFORE UPDATE ON country_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ВСТАВКА ДАННЫХ ФЛАГОВ
-- =====================================================
-- Используем Flagpedia CDN для надежных публичных URL флагов
-- Формат: https://flagcdn.com/{size}/{country-code}.png
-- Доступные размеры: 16, 20, 24, 32, 40, 48, 64, 80, 96, 120, 160, 240, 320

-- Вставляем флаги для каждого языка
INSERT INTO country_flags (country_code, language_code, flag_url, flag_emoji) VALUES
  -- Русский язык (Россия)
  ('RU', 'ru', 'https://flagcdn.com/w320/ru.png', '🇷🇺'),
  
  -- Английский язык (Великобритания)
  ('GB', 'en', 'https://flagcdn.com/w320/gb.png', '🇬🇧'),
  
  -- Белорусский язык (Беларусь)
  ('BY', 'be', 'https://flagcdn.com/w320/by.png', '🇧🇾'),
  
  -- Китайский язык (Китай)
  ('CN', 'zh', 'https://flagcdn.com/w320/cn.png', '🇨🇳')
ON CONFLICT (country_code) DO UPDATE SET
  flag_url = EXCLUDED.flag_url,
  flag_emoji = EXCLUDED.flag_emoji,
  updated_at = NOW();

-- =====================================================
-- ПРОВЕРКА ДАННЫХ
-- =====================================================
-- Выполните эту команду, чтобы проверить что флаги добавлены:
-- SELECT * FROM country_flags ORDER BY language_code;

-- =====================================================
-- ИНСТРУКЦИИ ПО ПРИМЕНЕНИЮ
-- =====================================================
-- 1. Скопируйте весь этот SQL код
-- 2. Откройте Supabase Dashboard -> SQL Editor
-- 3. Вставьте код и нажмите "Run"
-- 4. Проверьте что таблица создана: Table Editor -> country_flags
-- 5. Убедитесь что 4 записи добавлены
-- =====================================================

-- =====================================================
-- АЛЬТЕРНАТИВНЫЕ CDN ДЛЯ ФЛАГОВ
-- =====================================================
-- Если flagcdn.com не работает, используйте альтернативы:
-- 
-- 1. Flagpedia (основной):
--    https://flagcdn.com/w320/{country-code}.png
-- 
-- 2. Country Flags API:
--    https://countryflagsapi.com/png/{country-code}
-- 
-- 3. FlagsAPI:
--    https://flagsapi.com/{COUNTRY-CODE}/flat/64.png
--    (используйте заглавные буквы для кода страны)
-- 
-- Для обновления используйте:
-- UPDATE country_flags SET flag_url = 'https://новый-url.png' WHERE country_code = 'RU';
-- =====================================================
