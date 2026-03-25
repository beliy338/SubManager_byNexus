import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';

// Используем Cloudflare Worker прокси если указан, иначе прямое подключение
// Для обхода блокировки в России используйте VITE_SUPABASE_PROXY_URL
const supabaseUrl = import.meta.env.VITE_SUPABASE_PROXY_URL || `https://${projectId}.supabase.co`;

export const supabase = createClient(supabaseUrl, publicAnonKey);
