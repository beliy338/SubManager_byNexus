-- Fix RLS policies for services table to support both owner emails
-- Run this script in Supabase SQL Editor

-- First, drop existing policies
DROP POLICY IF EXISTS "Only owners can insert services" ON public.services;
DROP POLICY IF EXISTS "Only owners can update services" ON public.services;
DROP POLICY IF EXISTS "Only owners can delete services" ON public.services;

-- Recreate policies with case-insensitive email comparison
-- This ensures that emails like "BelovodVadim@gmail.com" will also match

-- Policy: Only owners can insert services
CREATE POLICY "Only owners can insert services"
    ON public.services
    FOR INSERT
    TO authenticated
    WITH CHECK (
        LOWER(auth.jwt() ->> 'email') IN ('max.sokolvp@gmail.com', 'belovodvadim@gmail.com')
    );

-- Policy: Only owners can update services
CREATE POLICY "Only owners can update services"
    ON public.services
    FOR UPDATE
    TO authenticated
    USING (
        LOWER(auth.jwt() ->> 'email') IN ('max.sokolvp@gmail.com', 'belovodvadim@gmail.com')
    )
    WITH CHECK (
        LOWER(auth.jwt() ->> 'email') IN ('max.sokolvp@gmail.com', 'belovodvadim@gmail.com')
    );

-- Policy: Only owners can delete services
CREATE POLICY "Only owners can delete services"
    ON public.services
    FOR DELETE
    TO authenticated
    USING (
        LOWER(auth.jwt() ->> 'email') IN ('max.sokolvp@gmail.com', 'belovodvadim@gmail.com')
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
WHERE tablename = 'services';
