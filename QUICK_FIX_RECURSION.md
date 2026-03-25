# ⚡ Быстрое исправление рекурсии в 3 шага

## Ошибка
```
infinite recursion detected in policy for relation "support_messages"
```

---

## Исправление

### 1. Supabase Dashboard → SQL Editor
https://supabase.com → Ваш проект → SQL Editor

### 2. Выполните скрипт
Скопируйте и запустите содержимое файла:
```
fix-support-messages-recursion.sql
```

### 3. Обновите приложение
Нажмите F5 в браузере

---

## Готово! ✅

Чат поддержки работает без ошибок.

---

## SQL скрипт (для быстрого копирования)

<details>
<summary>Нажмите, чтобы развернуть SQL код</summary>

```sql
-- FIX: Infinite recursion in support_messages RLS policies

-- Step 1: Create helper function
CREATE OR REPLACE FUNCTION public.is_user_parent_message(parent_id UUID, user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.support_messages 
        WHERE id = parent_id AND user_id = user_uuid
    );
END;
$$;

-- Step 2: Drop old policies
DROP POLICY IF EXISTS "Users can view own messages" ON public.support_messages;
DROP POLICY IF EXISTS "Users can view own messages and admin replies" ON public.support_messages;

-- Step 3: Create new policy
CREATE POLICY "Users can view own messages and admin replies"
    ON public.support_messages
    FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid()
        OR (
            is_admin_reply = true 
            AND parent_message_id IS NOT NULL
            AND public.is_user_parent_message(parent_message_id, auth.uid())
        )
        OR LOWER(auth.jwt() ->> 'email') IN ('max.sokolvp@gmail.com', 'belovodvadim@gmail.com')
    );

-- Step 4: Grant permissions
GRANT EXECUTE ON FUNCTION public.is_user_parent_message(UUID, UUID) TO authenticated;
```

</details>
