// ========================================
// ВНИМАНИЕ: Этот файл устарел!
// Используйте CLOUDFLARE_DASHBOARD_SIMPLE.js
// ========================================
//
// Этот файл использует ES6 модули (export default),
// которые не поддерживаются в Cloudflare Dashboard.
//
// Для Dashboard используйте файл:
// CLOUDFLARE_DASHBOARD_SIMPLE.js
//
// Этот файл оставлен для справки.
// ========================================

const SUPABASE_URL = 'https://echbyusirwoojodjhhzi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjaGJ5dXNpcndvb2pvZGpoaHppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2MjczNzgsImV4cCI6MjA4ODIwMzM3OH0.12dic5xSsfEWOzUlxnoAvmVIScLbqsupRKoCoeToKx4';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info, prefer, x-upsert',
  'Access-Control-Max-Age': '86400',
};

function handleOptions() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

async function handleRequest(request) {
  try {
    const url = new URL(request.url);
    const supabaseUrl = new URL(SUPABASE_URL + url.pathname + url.search);
    const headers = new Headers(request.headers);

    if (!headers.has('apikey')) {
      headers.set('apikey', SUPABASE_ANON_KEY);
    }

    const supabaseRequest = new Request(supabaseUrl, {
      method: request.method,
      headers: headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
    });

    const response = await fetch(supabaseRequest);
    const newHeaders = new Headers(response.headers);

    Object.keys(CORS_HEADERS).forEach(key => {
      newHeaders.set(key, CORS_HEADERS[key]);
    });

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

// ❌ Этот синтаксис НЕ работает в Dashboard
export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return handleOptions();
    }
    return handleRequest(request);
  },
};
