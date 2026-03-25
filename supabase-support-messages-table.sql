-- Create support_messages table for user support chat functionality
CREATE TABLE IF NOT EXISTS public.support_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    user_email TEXT NOT NULL,
    user_name TEXT NOT NULL,
    message TEXT NOT NULL,
    is_admin_reply BOOLEAN DEFAULT false,
    parent_message_id UUID REFERENCES public.support_messages(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies for support_messages table
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own messages, owners can view all
CREATE POLICY "Users can view own messages"
    ON public.support_messages
    FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid()
        OR LOWER(auth.jwt() ->> 'email') IN ('max.sokolvp@gmail.com', 'belovodvadim@gmail.com')
    );

-- Policy: Authenticated users can insert messages (simplified to allow all authenticated users)
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

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS support_messages_user_id_idx ON public.support_messages(user_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS support_messages_created_at_idx ON public.support_messages(created_at DESC);

-- Create index on is_admin_reply for filtering
CREATE INDEX IF NOT EXISTS support_messages_is_admin_reply_idx ON public.support_messages(is_admin_reply);

-- Add comment to table
COMMENT ON TABLE public.support_messages IS 'Stores support chat messages between users and owners. Users can only see their own messages, while owners (max.sokolvp@gmail.com and belovodvadim@gmail.com) can see all messages.';