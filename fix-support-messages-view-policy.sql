-- ⚠️ DEPRECATED - This file causes infinite recursion!
-- ⚠️ Use /fix-support-messages-recursion.sql instead
-- 
-- FIX support_messages table policies
-- Use this to fix the SELECT policy without losing existing messages
-- This allows users to see admin replies to their messages

-- PROBLEM: The subquery in line 24 causes infinite recursion
-- because it queries the same table that the policy is protecting

-- Drop the old SELECT policy
DROP POLICY IF EXISTS "Users can view own messages" ON public.support_messages;
DROP POLICY IF EXISTS "Users can view own messages and admin replies" ON public.support_messages;

-- ❌ THIS POLICY CAUSES INFINITE RECURSION - DO NOT USE
CREATE POLICY "Users can view own messages and admin replies"
    ON public.support_messages
    FOR SELECT
    TO authenticated
    USING (
        -- User can see their own messages
        user_id = auth.uid()
        -- OR user can see admin replies to their messages
        OR (
            is_admin_reply = true 
            AND parent_message_id IN (
                -- ❌ THIS SUBQUERY CAUSES RECURSION!
                SELECT id FROM public.support_messages WHERE user_id = auth.uid()
            )
        )
        -- OR user is an owner and can see all messages
        OR LOWER(auth.jwt() ->> 'email') IN ('max.sokolvp@gmail.com', 'belovodvadim@gmail.com')
    );

-- Verify the policy was created
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'support_messages' AND cmd = 'SELECT';