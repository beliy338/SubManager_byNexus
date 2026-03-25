-- Complete setup for support_messages table with all fixes
-- This script creates the table and configures all necessary policies
-- Run this ONCE in Supabase Dashboard SQL Editor

-- Step 1: Drop existing table and policies (if exists) to start fresh
DROP TABLE IF EXISTS public.support_messages CASCADE;

-- Step 2: Create support_messages table
CREATE TABLE public.support_messages (
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

-- Step 3: Enable Row Level Security
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies

-- Policy: Users can view own messages + admin replies to their messages, owners can view all
CREATE POLICY "Users can view own messages"
    ON public.support_messages
    FOR SELECT
    TO authenticated
    USING (
        -- User can see their own messages
        user_id = auth.uid()
        OR
        -- User can see admin replies to their messages
        (
            is_admin_reply = true 
            AND parent_message_id IN (
                SELECT id FROM public.support_messages WHERE user_id = auth.uid()
            )
        )
        OR
        -- Owners can see all messages
        LOWER(auth.jwt() ->> 'email') IN ('max.sokolvp@gmail.com', 'belovodvadim@gmail.com')
    );

-- Policy: Users can insert their own messages, owners can insert any message
CREATE POLICY "Users can insert messages"
    ON public.support_messages
    FOR INSERT
    TO authenticated
    WITH CHECK (
        user_id = auth.uid()
        OR LOWER(auth.jwt() ->> 'email') IN ('max.sokolvp@gmail.com', 'belovodvadim@gmail.com')
    );

-- Policy: Users can update their own recent messages + is_read field, owners can update any message
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

-- Step 5: Create indexes for better performance
CREATE INDEX support_messages_user_id_idx ON public.support_messages(user_id);
CREATE INDEX support_messages_created_at_idx ON public.support_messages(created_at DESC);
CREATE INDEX support_messages_is_admin_reply_idx ON public.support_messages(is_admin_reply);
CREATE INDEX support_messages_parent_id_idx ON public.support_messages(parent_message_id);
CREATE INDEX support_messages_is_read_idx ON public.support_messages(is_read);

-- Step 6: Add table comment
COMMENT ON TABLE public.support_messages IS 'Stores support chat messages between users and owners. Users can see their own messages and admin replies to their messages. Owners can see all messages.';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Support messages table setup completed successfully!';
END $$;
