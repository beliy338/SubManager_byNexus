-- FIX: Infinite recursion in support_messages RLS policies
-- This script creates a helper function to avoid recursion and updates the SELECT policy

-- Step 1: Create a helper function with SECURITY DEFINER to bypass RLS
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

-- Step 2: Drop the existing problematic SELECT policy
DROP POLICY IF EXISTS "Users can view own messages" ON public.support_messages;
DROP POLICY IF EXISTS "Users can view own messages and admin replies" ON public.support_messages;

-- Step 3: Create new SELECT policy using the helper function
CREATE POLICY "Users can view own messages and admin replies"
    ON public.support_messages
    FOR SELECT
    TO authenticated
    USING (
        -- User can see their own messages
        user_id = auth.uid()
        -- OR user can see admin replies to their messages (using helper function to avoid recursion)
        OR (
            is_admin_reply = true 
            AND parent_message_id IS NOT NULL
            AND public.is_user_parent_message(parent_message_id, auth.uid())
        )
        -- OR user is an owner and can see all messages
        OR LOWER(auth.jwt() ->> 'email') IN ('max.sokolvp@gmail.com', 'belovodvadim@gmail.com')
    );

-- Step 4: Verify the policy was created successfully
SELECT 
    policyname, 
    cmd, 
    CASE 
        WHEN qual IS NOT NULL THEN 'Policy created successfully'
        ELSE 'Policy not created'
    END as status
FROM pg_policies
WHERE tablename = 'support_messages' AND cmd = 'SELECT';

-- Step 5: Grant execute permission on the helper function to authenticated users
GRANT EXECUTE ON FUNCTION public.is_user_parent_message(UUID, UUID) TO authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Support messages RLS policies have been fixed!';
    RAISE NOTICE 'Users can now view:';
    RAISE NOTICE '  1. Their own messages';
    RAISE NOTICE '  2. Admin replies to their messages';
    RAISE NOTICE '  3. Owners can see all messages';
END $$;
