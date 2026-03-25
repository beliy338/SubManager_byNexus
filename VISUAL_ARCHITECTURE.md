# 🏗️ Визуальная архитектура SubManager

**Дата:** 15 марта 2026  
**Цель:** Понять, почему ошибка 403 не критична

---

## 📊 Текущая архитектура (правильная)

```
┌─────────────────────────────────────────────────────────────┐
│                    БРАУЗЕР (Frontend)                        │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │           React Application                         │    │
│  │                                                      │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │  Components (UI)                              │  │    │
│  │  │  - Login.tsx                                  │  │    │
│  │  │  - Signup.tsx                                 │  │    │
│  │  │  - Dashboard.tsx                              │  │    │
│  │  │  - Subscriptions.tsx                          │  │    │
│  │  │  - SelectServiceModal.tsx                     │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  │                      ↓                               │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │  AppContext.tsx (State Management)           │  │    │
│  │  │                                               │  │    │
│  │  │  - addSubscription()                         │  │    │
│  │  │  - updateSubscription()                      │  │    │
│  │  │  - deleteSubscription()                      │  │    │
│  │  │  - updateSettings()                          │  │    │
│  │  │  - loadUserData()                            │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  │                      ↓                               │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │  Supabase SDK Client                         │  │    │
│  │  │  import { supabase } from './utils/supabase' │  │    │
│  │  │                                               │  │    │
│  │  │  Methods:                                     │  │    │
│  │  │  - supabase.from('subscriptions')...         │  │    │
│  │  │  - supabase.from('user_settings')...         │  │    │
│  │  │  - supabase.from('services')...              │  │    │
│  │  │  - supabase.auth.signUp()                    │  │    │
│  │  │  - supabase.auth.signIn()                    │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    HTTPS Requests
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  SUPABASE CLOUD (Backend)                    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Authentication (Supabase Auth)                     │    │
│  │  - Email/Password                                   │    │
│  │  - OAuth (Gmail)                                    │    │
│  │  - Session Management                               │    │
│  └────────────────────────────────────────────────────┘    │
│                            ↓                                 │
│  ┌────────────────────────────────────────────────────┐    │
│  │  PostgreSQL Database                                │    │
│  │                                                      │    │
│  │  Tables:                                            │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │  subscriptions                                │  │    │
│  │  │  - id, user_id, name, category, price...     │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │  user_settings                                │  │    │
│  │  │  - user_id, language, currency, theme...     │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │  services                                     │  │    │
│  │  │  - id, name, category, pricing_plans...      │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  │                                                      │    │
│  │  Row Level Security (RLS):                          │    │
│  │  - Users see only their own data                    │    │
│  │  - Owners can create/edit services                  │    │
│  └────────────────────────────────────────────────────┘    │
│                            ↓                                 │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Realtime Subscriptions                             │    │
│  │  - Auto-sync changes across devices                 │    │
│  │  - WebSocket connections                            │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Edge Functions (НЕ ИСПОЛЬЗУЮТСЯ!) ❌               │    │
│  │  /supabase/functions/server/index.tsx               │    │
│  │  - Упрощена до минимума                             │    │
│  │  - Возвращает только health check                   │    │
│  │  - НЕ участвует в работе приложения                 │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚠️ Старая архитектура (неправильная, но была раньше)

```
┌─────────────────────────────────────────────────────────────┐
│                    БРАУЗЕР (Frontend)                        │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  React App                                          │    │
│  │           ↓                                          │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │  api.ts (Old API layer) ❌                    │  │    │
│  │  │  - api.signup()                               │  │    │
│  │  │  - api.addSubscription()                      │  │    │
│  │  │  - api.updateSettings()                       │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            ↓
                  HTTP to Edge Function
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE CLOUD                            │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Edge Function ❌                                    │    │
│  │  /functions/v1/make-server-076c1030                 │    │
│  │           ↓                                          │    │
│  │  - Аутентификация                                   │    │
│  │  - Работа с KV store                                │    │
│  │  - Обработка запросов                               │    │
│  │           ↓                                          │    │
│  │  PostgreSQL Database                                │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘

ПРОБЛЕМА: Edge Function требует развертывания (ошибка 403)
```

---

## 🔄 Поток данных (текущий)

### 📝 Добавление подписки

```
1. User clicks "Добавить подписку"
         ↓
2. SelectServiceModal.tsx opens
         ↓
3. User selects service & plan
         ↓
4. Calls: addSubscription() in AppContext
         ↓
5. AppContext calls: supabase.from('subscriptions').insert(...)
         ↓
6. Direct INSERT to PostgreSQL (Supabase)
         ↓
7. Row Level Security checks user_id
         ↓
8. Data saved in database
         ↓
9. Realtime subscription triggers
         ↓
10. UI updates automatically
```

**Время:** ~100-300 мс  
**Edge Function:** ❌ Не используется

---

### 🔐 Аутентификация

```
1. User enters email/password
         ↓
2. Login.tsx calls: supabase.auth.signInWithPassword()
         ↓
3. Direct call to Supabase Auth
         ↓
4. Returns: { user, session, access_token }
         ↓
5. AppContext stores user & token
         ↓
6. Loads user data: loadUserData(user.id)
         ↓
7. Queries:
   - supabase.from('subscriptions').select('*').eq('user_id', ...)
   - supabase.from('user_settings').select('*').eq('user_id', ...)
         ↓
8. State updated, UI renders
```

**Время:** ~500-1000 мс  
**Edge Function:** ❌ Не используется

---

## 🛡️ Row Level Security (RLS)

### Политики для subscriptions

```sql
-- SELECT: Users can view their own subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: Users can insert their own subscriptions
CREATE POLICY "Users can insert their own subscriptions"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can update their own subscriptions
CREATE POLICY "Users can update their own subscriptions"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- DELETE: Users can delete their own subscriptions
CREATE POLICY "Users can delete their own subscriptions"
  ON subscriptions FOR DELETE
  USING (auth.uid() = user_id);
```

### Политики для services

```sql
-- SELECT: All authenticated users can view services
CREATE POLICY "Anyone can view services"
  ON services FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: Only owners can create services
CREATE POLICY "Only owners can insert services"
  ON services FOR INSERT
  TO authenticated
  WITH CHECK (
    LOWER(auth.jwt() ->> 'email') IN (
      'max.sokolvp@gmail.com', 
      'belovodvadim@gmail.com'
    )
  );
```

**Безопасность:** Обеспечивается на уровне БД, не на уровне приложения!

---

## 📡 Realtime Sync

```
User A adds subscription
         ↓
INSERT into database
         ↓
PostgreSQL trigger fires
         ↓
Realtime server notifies all subscribed clients
         ↓
User A (same device) → UI updates
User A (other device) → UI updates
User B (not affected) → No update
```

**Реализация в AppContext:**
```typescript
const subscriptionsChannel = supabase
  .channel('subscriptions-changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'subscriptions',
    filter: `user_id=eq.${user.id}`
  }, (payload) => {
    // Update local state
  })
  .subscribe();
```

---

## ❌ Edge Function (не используется)

### Текущее состояние

```typescript
// /supabase/functions/server/index.tsx

import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";

const app = new Hono();

app.use("/*", cors({ origin: "*" }));

// Единственный endpoint
app.get("/make-server-076c1030/health", (c) => {
  return c.json({ 
    status: "ok", 
    message: "Not used. App uses direct SDK calls." 
  });
});

app.all("/*", (c) => {
  return c.json({ 
    status: "deprecated" 
  }, 200);
});

Deno.serve(app.fetch);
```

### Почему ошибка 403?

```
Figma Make пытается развернуть Edge Function
         ↓
Требуются права Owner в Supabase проекте
         ↓
Права недоступны или истекли
         ↓
403 Forbidden
```

### Почему не критично?

```
Edge Function НЕ используется
         ↓
Приложение работает через Supabase SDK
         ↓
Все данные идут напрямую в PostgreSQL
         ↓
Ошибка не влияет на функциональность
```

---

## 📊 Сравнение подходов

| Аспект | Edge Functions (старое) | Supabase SDK (текущее) |
|--------|------------------------|------------------------|
| **Скорость** | ~500-1000 мс | ~100-300 мс |
| **Развертывание** | Требуется (403 error) | Не требуется ✅ |
| **Сложность** | Высокая | Низкая ✅ |
| **Безопасность** | На уровне функции | На уровне БД (RLS) ✅ |
| **Realtime** | Требует доп. настройки | Встроено ✅ |
| **Масштабируемость** | Ограничена | Высокая ✅ |

---

## ✅ Вывод

### Почему ошибка 403 не критична:

1. ✅ **Edge Function не используется** - весь код переписан на SDK
2. ✅ **Прямые вызовы в БД** - быстрее и надежнее
3. ✅ **RLS на уровне БД** - безопаснее
4. ✅ **Realtime встроен** - синхронизация из коробки
5. ✅ **Не требует развертывания** - работает сразу

### Можно ли удалить Edge Function?

**Да**, но не обязательно:
- Она не мешает работе
- Занимает минимум места
- Может пригодиться в будущем

---

**Дата:** 15 марта 2026  
**Версия:** 1.0  
**Статус:** ✅ Документировано
