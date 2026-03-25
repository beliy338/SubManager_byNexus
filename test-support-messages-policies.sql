-- TEST script to verify support_messages policies are working correctly
-- Run this AFTER applying fix-support-messages-recursion.sql

-- Check if the table exists
SELECT 
    'Table exists: ' || CASE WHEN EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'support_messages'
    ) THEN '✅ YES' ELSE '❌ NO' END as table_check;

-- Check if RLS is enabled
SELECT 
    'RLS enabled: ' || CASE WHEN relrowsecurity THEN '✅ YES' ELSE '❌ NO' END as rls_check
FROM pg_class
WHERE relname = 'support_messages';

-- Check if helper function exists
SELECT 
    'Helper function exists: ' || CASE WHEN EXISTS (
        SELECT FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' 
        AND p.proname = 'is_user_parent_message'
    ) THEN '✅ YES' ELSE '❌ NO' END as function_check;

-- List all policies on support_messages table
SELECT 
    '📋 Policy: ' || policyname || ' (' || cmd || ')' as policy_info
FROM pg_policies
WHERE tablename = 'support_messages'
ORDER BY policyname;

-- Check permissions on the helper function
SELECT 
    'Function permissions: ' || 
    CASE WHEN has_function_privilege('authenticated', 'public.is_user_parent_message(uuid, uuid)', 'EXECUTE') 
    THEN '✅ GRANTED' 
    ELSE '❌ NOT GRANTED' 
    END as permission_check;

-- Count existing messages
SELECT 
    'Total messages in table: ' || COUNT(*) as message_count
FROM public.support_messages;

-- Summary
SELECT '🎉 All checks completed! Review the results above.' as summary;
