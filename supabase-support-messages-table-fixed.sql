-- Create support_messages table for user support chat functionality
-- UPDATED VERSION with fixed RLS policies (no recursion)

-- Step 1: Create the table
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

-- Step 2: Enable RLS
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- Step 3: Create helper function to avoid recursion in RLS policies
CREATE OR REPLACE FUNCTION public.is_user_parent_message(parent_id UUID, user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Check if the parent message belongs to the user
    -- SECURITY DEFINER means this runs with the function owner's privileges, bypassing RLS
    RETURN EXISTS (
        SELECT 1 
        FROM public.support_messages 
        WHERE id = parent_id AND user_id = user_uuid
    );
END;
$$;

-- Step 4: Grant execute permission on the helper function
GRANT EXECUTE ON FUNCTION public.is_user_parent_message(UUID, UUID) TO authenticated;

-- Step 5: Create RLS policies

-- Policy: Users can view their own messages and admin replies to their messages
CREATE POLICY "Users can view own messages and admin replies"
    ON public.support_messages
    FOR SELECT
    TO authenticated
    USING (
        -- User can see their own messages
        user_id = auth.uid()
        -- OR user can see admin replies to their messages (using helper function)
        OR (
            is_admin_reply = true 
            AND parent_message_id IS NOT NULL
            AND public.is_user_parent_message(parent_message_id, auth.uid())
        )
        -- OR user is an owner and can see all messages
        OR LOWER(auth.jwt() ->> 'email') IN ('max.sokolvp@gmail.com', 'belovodvadim@gmail.com')
    );

-- Policy: Authenticated users can insert messages
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

-- Step 6: Create indexes
CREATE INDEX IF NOT EXISTS support_messages_user_id_idx ON public.support_messages(user_id);
CREATE INDEX IF NOT EXISTS support_messages_created_at_idx ON public.support_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS support_messages_is_admin_reply_idx ON public.support_messages(is_admin_reply);
CREATE INDEX IF NOT EXISTS support_messages_parent_message_id_idx ON public.support_messages(parent_message_id);

-- Step 7: Add comment to table
COMMENT ON TABLE public.support_messages IS 'Stores support chat messages between users and owners. Uses helper function to avoid RLS recursion. Users can see their own messages and admin replies, while owners (max.sokolvp@gmail.com and belovodvadim@gmail.com) can see all messages.';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Support messages table created successfully with fixed RLS policies!';
    RAISE NOTICE 'No infinite recursion issues - safe to use.';
END $$;
