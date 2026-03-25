-- =====================================================
-- МИГРАЦИЯ: Таблица для флагов стран
-- =====================================================
-- Дата: 25 марта 2026
-- Описание: Создает таблицу country_flags и заполняет её 6 флагами
-- =====================================================

-- Создаем функцию для обновления updated_at если её нет
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создаем таблицу для флагов стран
CREATE TABLE IF NOT EXISTS country_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL UNIQUE,
  language_code TEXT NOT NULL,
  flag_url TEXT NOT NULL,
  flag_emoji TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Включаем Row Level Security
ALTER TABLE country_flags ENABLE ROW LEVEL SECURITY;

-- Политики доступа
DROP POLICY IF EXISTS "Anyone can view country flags" ON country_flags;
CREATE POLICY "Anyone can view country flags"
  ON country_flags FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Owners can insert country flags" ON country_flags;
CREATE POLICY "Owners can insert country flags"
  ON country_flags FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE email IN ('max.sokolvp@gmail.com', 'belovodvadim@gmail.com')
    )
  );

DROP POLICY IF EXISTS "Owners can update country flags" ON country_flags;
CREATE POLICY "Owners can update country flags"
  ON country_flags FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE email IN ('max.sokolvp@gmail.com', 'belovodvadim@gmail.com')
    )
  );

DROP POLICY IF EXISTS "Owners can delete country flags" ON country_flags;
CREATE POLICY "Owners can delete country flags"
  ON country_flags FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE email IN ('max.sokolvp@gmail.com', 'belovodvadim@gmail.com')
    )
  );

-- Создаем индексы
CREATE INDEX IF NOT EXISTS idx_country_flags_language_code ON country_flags(language_code);
CREATE INDEX IF NOT EXISTS idx_country_flags_country_code ON country_flags(country_code);

-- Создаем триггер для updated_at
DROP TRIGGER IF EXISTS update_country_flags_updated_at ON country_flags;
CREATE TRIGGER update_country_flags_updated_at
  BEFORE UPDATE ON country_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Вставляем данные (6 флагов)
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
