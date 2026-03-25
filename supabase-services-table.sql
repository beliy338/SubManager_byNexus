-- Create services table for storing subscription services created by admin
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    is_popular BOOLEAN DEFAULT false,
    pricing_plans JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies for services table
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone authenticated can view all services
CREATE POLICY "Anyone can view services"
    ON public.services
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy: Only owners (max.sokolvp@gmail.com and belovodvadim@gmail.com) can insert services
-- Using LOWER() to ensure case-insensitive comparison
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

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS services_user_id_idx ON public.services(user_id);

-- Create index on category for filtering
CREATE INDEX IF NOT EXISTS services_category_idx ON public.services(category);

-- Create index on is_popular for sorting
CREATE INDEX IF NOT EXISTS services_is_popular_idx ON public.services(is_popular);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_services_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_services_updated_at_trigger ON public.services;
CREATE TRIGGER update_services_updated_at_trigger
    BEFORE UPDATE ON public.services
    FOR EACH ROW
    EXECUTE FUNCTION update_services_updated_at();

-- Create function to cascade delete user subscriptions when a service is deleted
CREATE OR REPLACE FUNCTION delete_service_subscriptions()
RETURNS TRIGGER AS $$
BEGIN
    -- Delete all user subscriptions that reference this service by name
    DELETE FROM public.subscriptions
    WHERE name = OLD.name;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to cascade delete subscriptions when service is deleted
DROP TRIGGER IF EXISTS cascade_delete_service_subscriptions ON public.services;
CREATE TRIGGER cascade_delete_service_subscriptions
    BEFORE DELETE ON public.services
    FOR EACH ROW
    EXECUTE FUNCTION delete_service_subscriptions();

-- Add comment to table
COMMENT ON TABLE public.services IS 'Stores subscription services that can be added by users. Only owners (max.sokolvp@gmail.com and belovodvadim@gmail.com) can create/edit/delete services. Deleting a service will cascade delete all user subscriptions using that service.';