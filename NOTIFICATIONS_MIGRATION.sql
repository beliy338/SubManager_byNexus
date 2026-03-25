-- ==================================================
-- Notifications System & Custom Subscriptions
-- ==================================================

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('billing_1day', 'billing_3day', 'subscription_added', 'subscription_deleted', 'subscription_updated', 'profile_updated', 'settings_updated', 'price_changed')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- RLS Policies for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;

-- Users can view only their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own notifications
CREATE POLICY "Users can insert own notifications"
  ON notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own notifications
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

-- Add custom subscription fields to subscriptions table
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS is_custom BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS custom_logo TEXT;

-- Create index for custom subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_is_custom ON subscriptions(user_id, is_custom) WHERE is_custom = true;

-- Comments
COMMENT ON TABLE notifications IS 'User notifications for billing, profile changes, and system events';
COMMENT ON COLUMN notifications.type IS 'Type of notification: billing_1day, billing_3day, subscription_added, subscription_deleted, subscription_updated, profile_updated, settings_updated, price_changed';
COMMENT ON COLUMN notifications.metadata IS 'Additional metadata for the notification (e.g., subscription_id, old_value, new_value)';
COMMENT ON COLUMN subscriptions.is_custom IS 'Indicates if this subscription was created by the user (not from predefined services)';
COMMENT ON COLUMN subscriptions.custom_logo IS 'Custom logo data URL (base64) for user-created subscriptions';

-- Verify tables
SELECT 'Notifications table' as table_name, COUNT(*) as row_count FROM notifications
UNION ALL
SELECT 'Subscriptions with custom flag' as table_name, COUNT(*) as row_count FROM subscriptions WHERE is_custom = true;