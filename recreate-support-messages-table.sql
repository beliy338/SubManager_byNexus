-- RECREATE support_messages table from scratch
-- Use this if you need to completely recreate the table

-- Drop the table if it exists (this will delete all existing messages!)
DROP TABLE IF EXISTS public.support_messages CASCADE;

-- Create support_messages table for user support chat functionality
CREATE TABLE public.support_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    user_email TEXT NOT NULL,
    user_name TEXT NOT NULL,
    message TEXT NOT NULL,
    is_admin_reply BOOLEAN DEFAULT false,
    parent_message_id UUID REFERENCES public.support_messages(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own messages AND admin replies to their messages, owners can view all
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
                SELECT id FROM public.support_messages WHERE user_id = auth.uid()
            )
        )
        -- OR user is an owner and can see all messages
        OR LOWER(auth.jwt() ->> 'email') IN ('max.sokolvp@gmail.com', 'belovodvadim@gmail.com')
    );

-- Policy: All authenticated users can insert messages
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

-- Create indexes for better performance
CREATE INDEX support_messages_user_id_idx ON public.support_messages(user_id);
CREATE INDEX support_messages_created_at_idx ON public.support_messages(created_at DESC);
CREATE INDEX support_messages_is_admin_reply_idx ON public.support_messages(is_admin_reply);

-- Add comment to table
COMMENT ON TABLE public.support_messages IS 'Stores support chat messages between users and owners. Users can only see their own messages, while owners can see all messages.';

-- Verify the table was created
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'support_messages'
ORDER BY ordinal_position;

-- Verify the policies were created
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'support_messages';