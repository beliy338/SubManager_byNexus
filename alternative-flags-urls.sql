-- =====================================================
-- АЛЬТЕРНАТИВНЫЕ URL ФЛАГОВ (ДЛЯ РОССИИ)
-- =====================================================
-- Используйте этот скрипт, если flagcdn.com заблокирован
-- Альтернативные CDN, которые работают в России
-- =====================================================

-- Вариант 1: FlagsAPI (работает в России)
UPDATE country_flags SET 
  flag_url = 'https://flagsapi.com/RU/flat/64.png'
WHERE country_code = 'RU';

UPDATE country_flags SET 
  flag_url = 'https://flagsapi.com/GB/flat/64.png'
WHERE country_code = 'GB';

UPDATE country_flags SET 
  flag_url = 'https://flagsapi.com/BY/flat/64.png'
WHERE country_code = 'BY';

UPDATE country_flags SET 
  flag_url = 'https://flagsapi.com/CN/flat/64.png'
WHERE country_code = 'CN';

UPDATE country_flags SET 
  flag_url = 'https://flagsapi.com/ES/flat/64.png'
WHERE country_code = 'ES';

UPDATE country_flags SET 
  flag_url = 'https://flagsapi.com/FR/flat/64.png'
WHERE country_code = 'FR';

-- =====================================================
-- ДРУГИЕ АЛЬТЕРНАТИВЫ
-- =====================================================

-- Вариант 2: Country Flags API
-- UPDATE country_flags SET flag_url = 'https://countryflagsapi.com/png/ru' WHERE country_code = 'RU';
-- UPDATE country_flags SET flag_url = 'https://countryflagsapi.com/png/gb' WHERE country_code = 'GB';
-- UPDATE country_flags SET flag_url = 'https://countryflagsapi.com/png/by' WHERE country_code = 'BY';
-- UPDATE country_flags SET flag_url = 'https://countryflagsapi.com/png/cn' WHERE country_code = 'CN';
-- UPDATE country_flags SET flag_url = 'https://countryflagsapi.com/png/es' WHERE country_code = 'ES';
-- UPDATE country_flags SET flag_url = 'https://countryflagsapi.com/png/fr' WHERE country_code = 'FR';

-- Вариант 3: REST Countries API (самый надёжный)
-- UPDATE country_flags SET flag_url = 'https://restcountries.com/data/rus.svg' WHERE country_code = 'RU';
-- UPDATE country_flags SET flag_url = 'https://restcountries.com/data/gbr.svg' WHERE country_code = 'GB';
-- UPDATE country_flags SET flag_url = 'https://restcountries.com/data/blr.svg' WHERE country_code = 'BY';
-- UPDATE country_flags SET flag_url = 'https://restcountries.com/data/chn.svg' WHERE country_code = 'CN';
-- UPDATE country_flags SET flag_url = 'https://restcountries.com/data/esp.svg' WHERE country_code = 'ES';
-- UPDATE country_flags SET flag_url = 'https://restcountries.com/data/fra.svg' WHERE country_code = 'FR';

-- =====================================================
-- ПРОВЕРКА
-- =====================================================
-- Проверить обновленные URL
SELECT 
  country_code,
  language_code,
  flag_emoji,
  flag_url
FROM country_flags
ORDER BY language_code;

-- =====================================================
-- ЗАМЕТКИ
-- =====================================================
-- 1. FlagsAPI - самый стабильный для России
-- 2. Country Flags API - простой и быстрый
-- 3. REST Countries - государственный API, очень надёжный
-- 4. Если нужно изменить размер на FlagsAPI:
--    /flat/64.png - плоский стиль, 64x64 px
--    /shiny/64.png - глянцевый стиль
--    Размеры: 16, 24, 32, 48, 64
-- =====================================================
