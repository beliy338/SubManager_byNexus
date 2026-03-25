/**
 * Cloudflare Worker Proxy для Supabase
 * Обходит блокировку Supabase в России
 */

// Константы
const SUPABASE_URL = 'https://echbyusirwoojodjhhzi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjaGJ5dXNpcndvb2pvZGpoaHppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2MjczNzgsImV4cCI6MjA4ODIwMzM3OH0.12dic5xSsfEWOzUlxnoAvmVIScLbqsupRKoCoeToKx4';

// Заголовки CORS
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info, prefer, x-upsert',
  'Access-Control-Max-Age': '86400',
};

/**
 * Обработка preflight запросов
 */
function handleOptions() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

/**
 * Проксирование запроса к Supabase
 */
async function handleRequest(request) {
  try {
    const url = new URL(request.url);

    // Создаем новый URL для Supabase
    const supabaseUrl = new URL(SUPABASE_URL + url.pathname + url.search);

    // Копируем заголовки из оригинального запроса
    const headers = new Headers(request.headers);

    // Добавляем apikey если его нет
    if (!headers.has('apikey')) {
      headers.set('apikey', SUPABASE_ANON_KEY);
    }

    // Создаем новый запрос к Supabase
    const supabaseRequest = new Request(supabaseUrl, {
      method: request.method,
      headers: headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
    });

    // Отправляем запрос к Supabase
    const response = await fetch(supabaseRequest);

    // Копируем ответ с новыми заголовками
    const newHeaders = new Headers(response.headers);

    // Добавляем CORS заголовки
    Object.keys(CORS_HEADERS).forEach(key => {
      newHeaders.set(key, CORS_HEADERS[key]);
    });

    // Возвращаем ответ
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Proxy Error',
      message: error.message,
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...CORS_HEADERS,
      },
    });
  }
}

/**
 * Главный обработчик worker
 */
export default {
  async fetch(request, env, ctx) {
    // Обработка preflight запросов
    if (request.method === 'OPTIONS') {
      return handleOptions();
    }

    // Обработка всех остальных запросов
    return handleRequest(request);
  },
};
