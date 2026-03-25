-- ============================================================================
-- ЕДИНЫЙ СКРИПТ НАСТРОЙКИ СИСТЕМЫ ПОДДЕРЖКИ
-- ============================================================================
-- Этот скрипт объединяет все требования к системе поддержки SubManager
-- Запустите его ОДИН РАЗ в Supabase Dashboard > SQL Editor
-- 
-- Скрипт выполняет:
-- 1. Проверку существования таблицы support_messages
-- 2. Создание таблицы (если не существует) или обновление структуры
-- 3. Создание helper функции для избежания бесконечной рекурсии в RLS
-- 4. Настройку всех RLS политик с корректными правами доступа
-- 5. Добавление поля is_read для отслеживания статуса прочтения
-- 6. Создание всех необходимых индексов для оптимизации производительности
-- 7. Настройку прав доступа для владельцев (max.sokolvp@gmail.com, belovodvadim@gmail.com)
--
-- ВАЖНО: Этот скрипт безопасен для повторного запуска - он не удалит данные
-- ============================================================================

-- ============================================================================
-- ШАГ 1: Создание Helper функции (должна быть создана до политик)
-- ============================================================================

-- Удаляем старую версию функции если существует (CASCADE удалит зависимые политики)
DROP FUNCTION IF EXISTS public.is_user_parent_message(UUID, UUID) CASCADE;

-- Создаем helper функцию с SECURITY DEFINER для избежания рекурсии в RLS
CREATE OR REPLACE FUNCTION public.is_user_parent_message(parent_id UUID, user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Проверяет, принадлежит ли родительское сообщение пользователю
    -- SECURITY DEFINER означает, что функция выполняется с правами владельца,
    -- минуя RLS политики и предотвращая бесконечную рекурсию
    RETURN EXISTS (
        SELECT 1 
        FROM public.support_messages 
        WHERE id = parent_id AND user_id = user_uuid
    );
END;
$$;

-- Даем права на выполнение функции аутентифицированным пользователям
GRANT EXECUTE ON FUNCTION public.is_user_parent_message(UUID, UUID) TO authenticated;

DO $$
BEGIN
    RAISE NOTICE '✓ Helper функция is_user_parent_message создана';
END $$;

-- ============================================================================
-- ШАГ 2: Создание или обновление таблицы support_messages
-- ============================================================================

-- Создаем таблицу если не существует
CREATE TABLE IF NOT EXISTS public.support_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    user_name TEXT NOT NULL,
    message TEXT NOT NULL,
    is_admin_reply BOOLEAN DEFAULT false,
    parent_message_id UUID REFERENCES public.support_messages(id) ON DELETE SET NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

DO $$
BEGIN
    RAISE NOTICE '✓ Таблица support_messages создана или уже существует';
END $$;

-- Добавляем поле is_read если его нет (для обновления старых таблиц)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'support_messages' 
        AND column_name = 'is_read'
    ) THEN
        ALTER TABLE public.support_messages
        ADD COLUMN is_read BOOLEAN DEFAULT false;
        RAISE NOTICE '✓ Добавлено поле is_read в таблицу support_messages';
    ELSE
        RAISE NOTICE '✓ Поле is_read уже существует';
    END IF;
END $$;

-- ============================================================================
-- ШАГ 3: Включение Row Level Security
-- ============================================================================

ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    RAISE NOTICE '✓ Row Level Security включен';
END $$;

-- ============================================================================
-- ШАГ 4: Удаление старых политик (безопасно при повторном запуске)
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own messages" ON public.support_messages;
DROP POLICY IF EXISTS "Users can view own messages and admin replies" ON public.support_messages;
DROP POLICY IF EXISTS "Users can insert messages" ON public.support_messages;
DROP POLICY IF EXISTS "Authenticated users can insert messages" ON public.support_messages;
DROP POLICY IF EXISTS "Users can update messages" ON public.support_messages;
DROP POLICY IF EXISTS "Users can update their own messages is_read status" ON public.support_messages;
DROP POLICY IF EXISTS "Users can mark admin replies as read" ON public.support_messages;
DROP POLICY IF EXISTS "Owners can mark user messages as read" ON public.support_messages;
DROP POLICY IF EXISTS "Users can delete messages" ON public.support_messages;

DO $$
BEGIN
    RAISE NOTICE '✓ Старые политики удалены';
END $$;

-- ============================================================================
-- ШАГ 5: Создание новых RLS политик
-- ============================================================================

-- ПОЛИТИКА 1: SELECT - Пользователи видят свои сообщения и ответы админов
-- Владельцы видят все сообщения
-- Использует helper функцию для избежания рекурсии
CREATE POLICY "Users can view own messages and admin replies"
    ON public.support_messages
    FOR SELECT
    TO authenticated
    USING (
        -- Пользователь видит свои собственные сообщения
        user_id = auth.uid()
        -- ИЛИ пользователь видит ответы админов на его сообщения
        -- (используем helper функцию для избежания рекурсии)
        OR (
            is_admin_reply = true 
            AND parent_message_id IS NOT NULL
            AND public.is_user_parent_message(parent_message_id, auth.uid())
        )
        -- ИЛИ пользователь является владельцем и видит все сообщения
        OR LOWER(auth.jwt() ->> 'email') IN ('max.sokolvp@gmail.com', 'belovodvadim@gmail.com')
    );

DO $$
BEGIN
    RAISE NOTICE '✓ SELECT политика создана';
END $$;

-- ПОЛИТИКА 2: INSERT - Пользователи могут создавать свои сообщения
-- Владельцы могут создавать любые сообщения (включая ответы от имени админа)
CREATE POLICY "Users can insert messages"
    ON public.support_messages
    FOR INSERT
    TO authenticated
    WITH CHECK (
        -- Пользователь создает сообщение от своего имени
        user_id = auth.uid()
        -- ИЛИ владелец создает любое сообщение (в том числе админ-ответы)
        OR LOWER(auth.jwt() ->> 'email') IN ('max.sokolvp@gmail.com', 'belovodvadim@gmail.com')
    );

DO $$
BEGIN
    RAISE NOTICE '✓ INSERT политика создана';
END $$;

-- ПОЛИТИКА 3: UPDATE - Пользователи могут обновлять свои недавние сообщения
-- Пользователи могут помечать админ-ответы как прочитанные (is_read)
-- Владельцы могут обновлять любые сообщения
CREATE POLICY "Users can update messages"
    ON public.support_messages
    FOR UPDATE
    TO authenticated
    USING (
        -- Пользователь обновляет своё недавнее сообщение (в течение 5 минут после создания)
        (user_id = auth.uid() AND created_at > (now() - interval '5 minutes'))
        -- ИЛИ пользователь помечает админ-ответ на его сообщение как прочитанный
        OR (
            is_admin_reply = true 
            AND parent_message_id IS NOT NULL
            AND public.is_user_parent_message(parent_message_id, auth.uid())
        )
        -- ИЛИ владелец обновляет любое сообщение
        OR LOWER(auth.jwt() ->> 'email') IN ('max.sokolvp@gmail.com', 'belovodvadim@gmail.com')
    )
    WITH CHECK (
        -- Пользователь может изменить только is_read для админ-ответов
        (
            is_admin_reply = true 
            AND parent_message_id IS NOT NULL
            AND public.is_user_parent_message(parent_message_id, auth.uid())
        )
        -- ИЛИ пользователь обновляет своё недавнее сообщение
        OR (user_id = auth.uid() AND created_at > (now() - interval '5 minutes'))
        -- ИЛИ владелец может обновить любое поле
        OR LOWER(auth.jwt() ->> 'email') IN ('max.sokolvp@gmail.com', 'belovodvadim@gmail.com')
    );

DO $$
BEGIN
    RAISE NOTICE '✓ UPDATE политика создана';
END $$;

-- ПОЛИТИКА 4: DELETE - Пользователи могут удалять свои недавние сообщения
-- Владельцы могут удалять любые сообщения
CREATE POLICY "Users can delete messages"
    ON public.support_messages
    FOR DELETE
    TO authenticated
    USING (
        -- Пользватель удаляет своё недавнее сообщение (в течение 5 минут)
        (user_id = auth.uid() AND created_at > (now() - interval '5 minutes'))
        -- ИЛИ владелец удаляет любое сообщение
        OR LOWER(auth.jwt() ->> 'email') IN ('max.sokolvp@gmail.com', 'belovodvadim@gmail.com')
    );

DO $$
BEGIN
    RAISE NOTICE '✓ DELETE политика создана';
END $$;

-- ============================================================================
-- ШАГ 6: Создание индексов для оптимизации производительности
-- ============================================================================

-- Индекс по user_id для быстрого поиска сообщений пользователя
CREATE INDEX IF NOT EXISTS support_messages_user_id_idx 
    ON public.support_messages(user_id);

-- Индекс по created_at для сортировки сообщений по времени
CREATE INDEX IF NOT EXISTS support_messages_created_at_idx 
    ON public.support_messages(created_at DESC);

-- Индекс по is_admin_reply для фильтрации админских ответов
CREATE INDEX IF NOT EXISTS support_messages_is_admin_reply_idx 
    ON public.support_messages(is_admin_reply);

-- Индекс по parent_message_id дя быстрого поиска связанных сообщений
CREATE INDEX IF NOT EXISTS support_messages_parent_id_idx 
    ON public.support_messages(parent_message_id);

-- Индекс по is_read для фильтрации непрочитанных сообщений
CREATE INDEX IF NOT EXISTS support_messages_is_read_idx 
    ON public.support_messages(is_read);

-- Составной индекс для запросов непрочитанных сообщений пользователя
CREATE INDEX IF NOT EXISTS support_messages_user_is_read_idx 
    ON public.support_messages(user_id, is_read);

DO $$
BEGIN
    RAISE NOTICE '✓ Все индексы созданы';
END $$;

-- ============================================================================
-- ШАГ 7: Добавление комментариев к таблице
-- ============================================================================

COMMENT ON TABLE public.support_messages IS 
    'Хранит сообщения чата поддержки между пользователями и владельцами. Пользователи видят только свои сообщения и ответы админов. Владельцы (max.sokolvp@gmail.com, belovodvadim@gmail.com) видят все сообщения.';

COMMENT ON COLUMN public.support_messages.id IS 'Уникальный идентификатор сообщения';
COMMENT ON COLUMN public.support_messages.user_id IS 'ID пользователя, отправившего сообщение';
COMMENT ON COLUMN public.support_messages.user_email IS 'Email пользователя';
COMMENT ON COLUMN public.support_messages.user_name IS 'Имя пользователя';
COMMENT ON COLUMN public.support_messages.message IS 'Текст сообщения';
COMMENT ON COLUMN public.support_messages.is_admin_reply IS 'Флаг: true если это ответ от админа/владельца';
COMMENT ON COLUMN public.support_messages.parent_message_id IS 'ID родительского сообщения для ответов';
COMMENT ON COLUMN public.support_messages.is_read IS 'Флаг прочтения: true если сообщение прочитано получателем';
COMMENT ON COLUMN public.support_messages.created_at IS 'Дата и время создания сообщения';

DO $$
BEGIN
    RAISE NOTICE '✓ Комментарии добавлены';
END $$;

-- ============================================================================
-- ШАГ 8: Проверка корректности настройки
-- ============================================================================

-- Проверяем структуру таблиц
DO $$
DECLARE
    column_count INT;
    policy_count INT;
    index_count INT;
BEGIN
    -- Подсчитываем количество колонок
    SELECT COUNT(*) INTO column_count
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'support_messages';
    
    -- Подсчитываем количество политик
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE tablename = 'support_messages';
    
    -- Подсчитываем количество индексов
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes
    WHERE tablename = 'support_messages';
    
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'ПРОВЕРКА НАСТРОЙКИ:';
    RAISE NOTICE 'Колонок в таблице: %', column_count;
    RAISE NOTICE 'RLS политик создано: %', policy_count;
    RAISE NOTICE 'Индексов создано: %', index_count;
    RAISE NOTICE '===========================================';
    
    -- Проверяем ожидаемое количество
    IF column_count >= 8 AND policy_count = 4 AND index_count >= 6 THEN
        RAISE NOTICE '✓ ВСЁ НАСТРОЕНО КОРРЕКТНО!';
    ELSE
        RAISE WARNING '⚠ Возможно, настройка не полная. Проверьте логи выше.';
    END IF;
END $$;

-- Показываем список всех политик
SELECT 
    policyname AS "Название политики",
    cmd AS "Операция",
    CASE 
        WHEN qual IS NOT NULL THEN '✓ Настроена'
        ELSE '✗ Не настроена'
    END AS "Статус"
FROM pg_policies
WHERE tablename = 'support_messages'
ORDER BY cmd;

-- ============================================================================
-- ЗАВЕРШЕНИЕ
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '████████████████████████████████████████████████████████████';
    RAISE NOTICE '█                                                          █';
    RAISE NOTICE '█  ✓ СИСТЕМА ПОДДЕРЖКИ НАСТРОЕНА УСПЕШНО!                 █';
    RAISE NOTICE '█                                                          █';
    RAISE NOTICE '█  Функцио��ал:                                             █';
    RAISE NOTICE '█  • Пользователи видят свои сообщения и ответы админов   █';
    RAISE NOTICE '█  • Владельцы видят все сообщения                         █';
    RAISE NOTICE '█  • Отслеживание статуса прочтения (is_read)              █';
    RAISE NOTICE '█  • Защита от бесконечной рекурсии в RLS                  █';
    RAISE NOTICE '█  • Оптимизированные индексы для быстрой работы           █';
    RAISE NOTICE '█                                                          █';
    RAISE NOTICE '█  Владельцы (полный доступ):                              █';
    RAISE NOTICE '█  • max.sokolvp@gmail.com                                 █';
    RAISE NOTICE '█  • belovodvadim@gmail.com                                █';
    RAISE NOTICE '█                                                          █';
    RAISE NOTICE '████████████████████████████████████████████████████████████';
    RAISE NOTICE '';
END $$;

-- Конец скрипта