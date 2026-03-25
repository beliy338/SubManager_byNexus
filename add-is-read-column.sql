-- Add is_read column to support_messages table for read status tracking
-- This migration adds a boolean column to track whether a message has been read

-- Add is_read column (defaults to false for new messages)
ALTER TABLE public.support_messages
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;

-- Create index on is_read for better query performance
CREATE INDEX IF NOT EXISTS idx_support_messages_is_read 
ON public.support_messages(is_read);

-- Create composite index for unread message queries
CREATE INDEX IF NOT EXISTS idx_support_messages_user_is_read 
ON public.support_messages(user_id, is_read);

-- Add comment to column
COMMENT ON COLUMN public.support_messages.is_read IS 'Indicates whether the message has been read by the recipient';

-- Update RLS policies to allow users to update is_read status
-- Drop existing update policy if it exists
DROP POLICY IF EXISTS "Users can update their own messages is_read status" ON public.support_messages;

-- Create new update policy for regular users
-- Users can mark admin replies to their messages as read
CREATE POLICY "Users can mark admin replies as read"
ON public.support_messages
FOR UPDATE
TO authenticated
USING (
  -- Can only update messages that are admin replies to their own messages
  is_admin_reply = true
  AND parent_message_id IN (
    SELECT id FROM public.support_messages WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  -- Can only update messages that are admin replies to their own messages
  is_admin_reply = true
  AND parent_message_id IN (
    SELECT id FROM public.support_messages WHERE user_id = auth.uid()
  )
);

-- Create update policy for owners
-- Owners can mark any user message (non-admin-reply) as read
CREATE POLICY "Owners can mark user messages as read"
ON public.support_messages
FOR UPDATE
TO authenticated
USING (
  -- Check if user is an owner
  auth.email() IN ('max.sokolvp@gmail.com', 'belovodvadim@gmail.com')
  -- Can only update non-admin-reply messages (user messages)
  AND is_admin_reply = false
)
WITH CHECK (
  -- Check if user is an owner
  auth.email() IN ('max.sokolvp@gmail.com', 'belovodvadim@gmail.com')
  -- Can only update non-admin-reply messages (user messages)
  AND is_admin_reply = false
);

-- Verification query (optional - run this to check the changes)
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'support_messages' AND column_name = 'is_read';
