-- =====================================================
-- БЫСТРАЯ ВСТАВКА 6 ФЛАГОВ В БАЗУ ДАННЫХ
-- =====================================================
-- Инструкция:
-- 1. Откройте Supabase Dashboard
-- 2. Перейдите в SQL Editor
-- 3. Скопируйте и вставьте этот код
-- 4. Нажмите "Run" или Ctrl+Enter
-- =====================================================

-- Создаем функцию для updated_at если её нет
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создаем таблицу country_flags
CREATE TABLE IF NOT EXISTS country_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL UNIQUE,
  language_code TEXT NOT NULL,
  flag_url TEXT NOT NULL,
  flag_emoji TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Включаем RLS
ALTER TABLE country_flags ENABLE ROW LEVEL SECURITY;

-- Политики (чтение для всех)
DROP POLICY IF EXISTS "Anyone can view country flags" ON country_flags;
CREATE POLICY "Anyone can view country flags"
  ON country_flags FOR SELECT USING (true);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_country_flags_language_code ON country_flags(language_code);
CREATE INDEX IF NOT EXISTS idx_country_flags_country_code ON country_flags(country_code);

-- Триггер
DROP TRIGGER IF EXISTS update_country_flags_updated_at ON country_flags;
CREATE TRIGGER update_country_flags_updated_at
  BEFORE UPDATE ON country_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ВСТАВКА 6 ФЛАГОВ
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

-- Проверка: должно вывести 6 записей
SELECT 
  country_code, 
  language_code, 
  flag_emoji,
  substring(flag_url from 1 for 50) as flag_url_preview
FROM country_flags 
ORDER BY language_code;
