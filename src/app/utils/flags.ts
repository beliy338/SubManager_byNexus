import { supabase } from './supabase';

export interface CountryFlag {
  id: string;
  country_code: string;
  language_code: string;
  flag_url: string;
  flag_emoji?: string;
  created_at: string;
  updated_at: string;
}

// Локальные флаги как fallback если база данных недоступна
import flagRU from 'figma:asset/1759cefbc812d725432999f481456881c8a87b80.png';
import flagBY from 'figma:asset/97976980503fcbca3c45782f1316e42143ba93d0.png';
import flagCN from 'figma:asset/d8091d777293aaf9f4df4523ab5346354a29fbb4.png';
import flagGB from 'figma:asset/a8d112cfd79c27f4c24a17a55e6e034d741cf181.png';

const localFlags: Record<string, string> = {
  'ru': flagRU,
  'en': flagGB,
  'be': flagBY,
  'zh': flagCN
};

// Кеш для флагов
let flagsCache: Map<string, string> | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 3600000; // 1 час в миллисекундах

/**
 * Загружает флаги стран из Supabase Database
 * Использует кеширование для минимизации запросов к базе данных
 */
export async function loadCountryFlags(): Promise<Map<string, string>> {
  // Проверяем кеш
  const now = Date.now();
  if (flagsCache && (now - lastFetchTime) < CACHE_DURATION) {
    return flagsCache;
  }

  try {
    const { data, error } = await supabase
      .from('country_flags')
      .select('language_code, flag_url');

    if (error) {
      console.error('Error loading country flags from database:', error);
      // Возвращаем локальные флаги как fallback
      return new Map(Object.entries(localFlags));
    }

    if (!data || data.length === 0) {
      console.warn('No country flags found in database, using local flags');
      return new Map(Object.entries(localFlags));
    }

    // Создаем Map из данных базы
    flagsCache = new Map(
      data.map((flag: any) => [flag.language_code, flag.flag_url])
    );
    
    lastFetchTime = now;
    return flagsCache;
  } catch (err) {
    console.error('Failed to load country flags:', err);
    // Возвращаем локальные флаги как fallback
    return new Map(Object.entries(localFlags));
  }
}

/**
 * Получает URL флага для указанного языка
 * @param languageCode - код языка (ru, en, be, zh)
 * @returns URL флага или локальный флаг как fallback
 */
export async function getFlagUrl(languageCode: string): Promise<string> {
  const flags = await loadCountryFlags();
  return flags.get(languageCode) || localFlags[languageCode] || localFlags['en'];
}

/**
 * Очищает кеш флагов (полезно после обновления данных в базе)
 */
export function clearFlagsCache(): void {
  flagsCache = null;
  lastFetchTime = 0;
}

/**
 * Предзагружает флаги при инициализации приложения
 */
export function preloadFlags(): void {
  loadCountryFlags().catch(err => {
    console.error('Failed to preload flags:', err);
  });
}
