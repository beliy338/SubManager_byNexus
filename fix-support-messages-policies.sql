-- Fix RLS policies for support_messages table
-- Run this if you already created the table but messages don't work

-- First, drop the foreign key constraint if it exists
ALTER TABLE public.support_messages 
DROP CONSTRAINT IF EXISTS support_messages_user_id_fkey;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own messages" ON public.support_messages;
DROP POLICY IF EXISTS "Users can insert messages" ON public.support_messages;
DROP POLICY IF EXISTS "Authenticated users can insert messages" ON public.support_messages;
DROP POLICY IF EXISTS "Users can update messages" ON public.support_messages;
DROP POLICY IF EXISTS "Users can delete messages" ON public.support_messages;

-- Recreate policies with correct permissions

-- Policy: Users can view their own messages, owners can view all
CREATE POLICY "Users can view own messages"
    ON public.support_messages
    FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid()
        OR LOWER(auth.jwt() ->> 'email') IN ('max.sokolvp@gmail.com', 'belovodvadim@gmail.com')
    );

-- Policy: All authenticated users can insert messages (simplified)
CREATE POLICY "Authenticated users can insert messages"
    ON public.support_messages
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Policy: Users can update their own recent messages, owners can update any message
CREATE POLICY "Users can update messages"
    ON public.support_messages
    FOR UPDATE
    TO authenticated
    USING (
        (user_id = auth.uid() AND created_at > (now() - interval '5 minutes'))
        OR LOWER(auth.jwt() ->> 'email') IN ('max.sokolvp@gmail.com', 'belovodvadim@gmail.com')
    );

-- Policy: Users can delete their own recent messages, owners can delete any message
CREATE POLICY "Users can delete messages"
    ON public.support_messages
    FOR DELETE
    TO authenticated
    USING (
        (user_id = auth.uid() AND created_at > (now() - interval '5 minutes'))
        OR LOWER(auth.jwt() ->> 'email') IN ('max.sokolvp@gmail.com', 'belovodvadim@gmail.com')
    );

-- Verify the policies were created
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'support_messages';