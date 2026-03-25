-- ============================================
-- SMART NOTIFICATIONS SYSTEM FOR SUBMANAGER
-- ============================================
-- This script creates tables and functions for:
-- 1. Email notifications before payment (1 day before)
-- 2. Email notifications when service settings change
-- 3. Email notifications when service is discontinued

-- ============================================
-- 1. CREATE NOTIFICATION SETTINGS TABLE
-- ============================================
-- Stores user notification preferences
CREATE TABLE IF NOT EXISTS public.notification_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    email TEXT NOT NULL,
    notify_before_payment BOOLEAN DEFAULT true,
    notify_days_before INTEGER DEFAULT 1,
    notify_service_changes BOOLEAN DEFAULT true,
    notify_service_discontinued BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own notification settings"
    ON public.notification_settings
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert own notification settings"
    ON public.notification_settings
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own notification settings"
    ON public.notification_settings
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

-- Create index
CREATE INDEX IF NOT EXISTS notification_settings_user_id_idx ON public.notification_settings(user_id);

-- ============================================
-- 2. CREATE NOTIFICATION LOGS TABLE
-- ============================================
-- Stores history of sent notifications to avoid duplicates
CREATE TABLE IF NOT EXISTS public.notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    subscription_id UUID,
    service_id UUID,
    notification_type TEXT NOT NULL CHECK (notification_type IN ('payment_reminder', 'service_changed', 'service_discontinued')),
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own notification logs"
    ON public.notification_logs
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() OR LOWER(auth.jwt() ->> 'email') IN ('max.sokolvp@gmail.com', 'belovodvadim@gmail.com'));

CREATE POLICY "System can insert notification logs"
    ON public.notification_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS notification_logs_user_id_idx ON public.notification_logs(user_id);
CREATE INDEX IF NOT EXISTS notification_logs_subscription_id_idx ON public.notification_logs(subscription_id);
CREATE INDEX IF NOT EXISTS notification_logs_sent_at_idx ON public.notification_logs(sent_at DESC);
CREATE INDEX IF NOT EXISTS notification_logs_type_idx ON public.notification_logs(notification_type);

-- ============================================
-- 3. CREATE FUNCTION TO GET UPCOMING PAYMENTS
-- ============================================
-- Returns subscriptions with upcoming payments that need notification
CREATE OR REPLACE FUNCTION get_subscriptions_needing_payment_notification()
RETURNS TABLE (
    subscription_id UUID,
    user_id UUID,
    user_email TEXT,
    subscription_name TEXT,
    price DECIMAL,
    billing_cycle TEXT,
    next_billing DATE,
    days_until_payment INTEGER,
    notify_days_before INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id AS subscription_id,
        s.user_id,
        ns.email AS user_email,
        s.name AS subscription_name,
        s.price,
        s.billing_cycle,
        s.next_billing,
        (s.next_billing - CURRENT_DATE) AS days_until_payment,
        ns.notify_days_before
    FROM subscriptions s
    INNER JOIN notification_settings ns ON s.user_id = ns.user_id
    WHERE
        -- User wants payment notifications
        ns.notify_before_payment = true
        -- Payment is upcoming within notification window
        AND s.next_billing > CURRENT_DATE
        AND (s.next_billing - CURRENT_DATE) <= ns.notify_days_before
        -- Notification hasn't been sent yet for this billing date
        AND NOT EXISTS (
            SELECT 1 FROM notification_logs nl
            WHERE nl.user_id = s.user_id
            AND nl.subscription_id = s.id
            AND nl.notification_type = 'payment_reminder'
            AND nl.sent_at::DATE >= CURRENT_DATE
            AND (nl.metadata->>'next_billing_date')::DATE = s.next_billing
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. CREATE FUNCTION TO LOG SERVICE CHANGES
-- ============================================
-- Trigger function to detect service changes and create notifications
CREATE OR REPLACE FUNCTION notify_service_changes()
RETURNS TRIGGER AS $$
DECLARE
    affected_users RECORD;
BEGIN
    -- Only process updates, not inserts or deletes
    IF TG_OP = 'UPDATE' THEN
        -- Check if pricing_plans changed
        IF OLD.pricing_plans IS DISTINCT FROM NEW.pricing_plans THEN
            -- Find all users with subscriptions using this service
            FOR affected_users IN
                SELECT DISTINCT
                    sub.user_id,
                    ns.email,
                    sub.id AS subscription_id,
                    sub.name AS subscription_name
                FROM subscriptions sub
                INNER JOIN notification_settings ns ON sub.user_id = ns.user_id
                WHERE sub.name = NEW.name
                AND ns.notify_service_changes = true
            LOOP
                -- Insert notification log (actual email will be sent by Edge Function)
                INSERT INTO notification_logs (
                    user_id,
                    subscription_id,
                    service_id,
                    notification_type,
                    email,
                    subject,
                    metadata
                ) VALUES (
                    affected_users.user_id,
                    affected_users.subscription_id,
                    NEW.id,
                    'service_changed',
                    affected_users.email,
                    'Изменения в подписке ' || affected_users.subscription_name,
                    jsonb_build_object(
                        'service_name', NEW.name,
                        'old_pricing', OLD.pricing_plans,
                        'new_pricing', NEW.pricing_plans,
                        'requires_action', true
                    )
                );
            END LOOP;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for service changes
DROP TRIGGER IF EXISTS service_changes_notification_trigger ON public.services;
CREATE TRIGGER service_changes_notification_trigger
    AFTER UPDATE ON public.services
    FOR EACH ROW
    EXECUTE FUNCTION notify_service_changes();

-- ============================================
-- 5. CREATE FUNCTION TO LOG SERVICE DISCONTINUATION
-- ============================================
-- Trigger function when a service is deleted
CREATE OR REPLACE FUNCTION notify_service_discontinued()
RETURNS TRIGGER AS $$
DECLARE
    affected_users RECORD;
BEGIN
    -- Find all users with subscriptions using this service
    FOR affected_users IN
        SELECT DISTINCT
            sub.user_id,
            ns.email,
            sub.id AS subscription_id,
            sub.name AS subscription_name
        FROM subscriptions sub
        INNER JOIN notification_settings ns ON sub.user_id = ns.user_id
        WHERE sub.name = OLD.name
        AND ns.notify_service_discontinued = true
    LOOP
        -- Insert notification log
        INSERT INTO notification_logs (
            user_id,
            subscription_id,
            service_id,
            notification_type,
            email,
            subject,
            metadata
        ) VALUES (
            affected_users.user_id,
            affected_users.subscription_id,
            OLD.id,
            'service_discontinued',
            affected_users.email,
            'Сервис ' || affected_users.subscription_name || ' прекратил работу',
            jsonb_build_object(
                'service_name', OLD.name,
                'message', 'Сервис больше не доступен. Ваша подписка будет автоматически удалена.',
                'requires_action', true
            )
        );
    END LOOP;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for service discontinuation
DROP TRIGGER IF EXISTS service_discontinued_notification_trigger ON public.services;
CREATE TRIGGER service_discontinued_notification_trigger
    BEFORE DELETE ON public.services
    FOR EACH ROW
    EXECUTE FUNCTION notify_service_discontinued();

-- ============================================
-- 6. CREATE FUNCTION TO INITIALIZE USER NOTIFICATION SETTINGS
-- ============================================
-- Automatically create notification settings when user signs up
CREATE OR REPLACE FUNCTION initialize_user_notification_settings()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notification_settings (user_id, email)
    VALUES (NEW.id, NEW.email)
    ON CONFLICT (user_id) DO UPDATE
    SET email = EXCLUDED.email;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to initialize notification settings on user creation
-- Note: This trigger works on auth.users which requires special permissions
-- If it fails, notification_settings will be created on first login or manually

-- ============================================
-- 7. HELPER FUNCTION TO MARK NOTIFICATION AS SENT
-- ============================================
CREATE OR REPLACE FUNCTION mark_notification_sent(
    p_user_id UUID,
    p_subscription_id UUID,
    p_notification_type TEXT,
    p_email TEXT,
    p_subject TEXT,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO notification_logs (
        user_id,
        subscription_id,
        notification_type,
        email,
        subject,
        metadata
    ) VALUES (
        p_user_id,
        p_subscription_id,
        p_notification_type,
        p_email,
        p_subject,
        p_metadata
    )
    RETURNING id INTO notification_id;

    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 8. CREATE UPDATED_AT TRIGGER FOR NOTIFICATION SETTINGS
-- ============================================
CREATE TRIGGER update_notification_settings_updated_at
    BEFORE UPDATE ON notification_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Verify tables were created
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('notification_settings', 'notification_logs');

-- Verify functions were created
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
    'get_subscriptions_needing_payment_notification',
    'notify_service_changes',
    'notify_service_discontinued',
    'initialize_user_notification_settings',
    'mark_notification_sent'
);

-- Verify triggers were created
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND trigger_name IN (
    'service_changes_notification_trigger',
    'service_discontinued_notification_trigger',
    'update_notification_settings_updated_at'
);

COMMENT ON TABLE public.notification_settings IS 'User notification preferences for email alerts';
COMMENT ON TABLE public.notification_logs IS 'History of sent notifications to prevent duplicates';
COMMENT ON FUNCTION get_subscriptions_needing_payment_notification() IS 'Returns subscriptions that need payment reminder notification';