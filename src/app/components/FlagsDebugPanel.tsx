import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { loadCountryFlags, clearFlagsCache } from '../utils/flags';

interface FlagData {
  country_code: string;
  language_code: string;
  flag_url: string;
  flag_emoji?: string;
}

export function FlagsDebugPanel() {
  const [flags, setFlags] = useState<FlagData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageStatuses, setImageStatuses] = useState<Record<string, 'loading' | 'success' | 'error'>>({});

  const loadFlags = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await supabase
        .from('country_flags')
        .select('*')
        .order('language_code');

      if (dbError) throw dbError;
      setFlags(data || []);
      
      // Initialize image statuses
      const statuses: Record<string, 'loading' | 'success' | 'error'> = {};
      data?.forEach(flag => {
        statuses[flag.country_code] = 'loading';
      });
      setImageStatuses(statuses);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testImageLoad = (countryCode: string, url: string) => {
    const img = new Image();
    img.onload = () => {
      setImageStatuses(prev => ({ ...prev, [countryCode]: 'success' }));
    };
    img.onerror = () => {
      setImageStatuses(prev => ({ ...prev, [countryCode]: 'error' }));
    };
    img.src = url;
  };

  useEffect(() => {
    loadFlags();
  }, []);

  useEffect(() => {
    // Test all image URLs
    flags.forEach(flag => {
      testImageLoad(flag.country_code, flag.flag_url);
    });
  }, [flags]);

  const handleRefresh = () => {
    clearFlagsCache();
    loadFlags();
  };

  if (loading) {
    return (
      <div className="p-4 bg-card rounded-lg border border-border">
        <p>Загрузка флагов...</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-card rounded-lg border border-border space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Отладка флагов ({flags.length} шт.)</h3>
        <button
          onClick={handleRefresh}
          className="px-3 py-1 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Обновить
        </button>
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive rounded-md text-destructive">
          <strong>Ошибка:</strong> {error}
        </div>
      )}

      {flags.length === 0 ? (
        <div className="p-3 bg-warning/10 border border-warning rounded-md">
          <p>Флаги не найдены в базе данных</p>
          <p className="text-sm mt-2">Выполните SQL скрипт: /insert-flags-quick.sql</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {flags.map(flag => (
            <div
              key={flag.country_code}
              className="p-3 border border-border rounded-md hover:bg-muted transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="relative">
                  <img
                    src={flag.flag_url}
                    alt={flag.country_code}
                    className="w-12 h-8 object-cover rounded border border-border"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  {imageStatuses[flag.country_code] === 'loading' && (
                    <div className="absolute inset-0 bg-muted animate-pulse rounded" />
                  )}
                  {imageStatuses[flag.country_code] === 'error' && (
                    <div className="absolute inset-0 bg-destructive/20 rounded flex items-center justify-center text-xs">
                      ❌
                    </div>
                  )}
                  {imageStatuses[flag.country_code] === 'success' && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{flag.flag_emoji || '🏳️'}</span>
                    <span className="font-mono text-sm font-semibold">{flag.country_code}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Язык: <span className="font-mono">{flag.language_code}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 truncate" title={flag.flag_url}>
                    {flag.flag_url.substring(0, 40)}...
                  </p>
                  {imageStatuses[flag.country_code] === 'success' && (
                    <p className="text-xs text-green-500 mt-1">✓ URL работает</p>
                  )}
                  {imageStatuses[flag.country_code] === 'error' && (
                    <p className="text-xs text-destructive mt-1">✗ URL недоступен</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="p-3 bg-muted rounded-md text-xs space-y-1">
        <p><strong>Подсказки:</strong></p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>Зелёный кружок = флаг загружается успешно</li>
          <li>Красный крестик = URL недоступен</li>
          <li>Если флагов нет, выполните SQL: <code className="bg-background px-1 rounded">/insert-flags-quick.sql</code></li>
          <li>Флаги кешируются на 1 час</li>
        </ul>
      </div>
    </div>
  );
}
