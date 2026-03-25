-- ==================================================
-- Update notifications type constraint
-- ==================================================
-- This migration adds missing notification types to the constraint

-- Drop the existing constraint
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Add the updated constraint with all notification types
ALTER TABLE notifications 
ADD CONSTRAINT notifications_type_check 
CHECK (type IN (
  'billing_1day', 
  'billing_3day', 
  'subscription_added', 
  'subscription_deleted', 
  'subscription_updated', 
  'profile_updated', 
  'settings_updated', 
  'price_changed'
));

-- Update the comment to reflect all supported types
COMMENT ON COLUMN notifications.type IS 'Type of notification: billing_1day, billing_3day, subscription_added, subscription_deleted, subscription_updated, profile_updated, settings_updated, price_changed';
