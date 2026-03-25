-- Add previous_billing column to subscriptions table
-- This column stores the old billing date for overdue subscriptions that have been moved forward

ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS previous_billing DATE;

-- Create index for faster queries on previous_billing
CREATE INDEX IF NOT EXISTS idx_subscriptions_previous_billing ON subscriptions(previous_billing);

-- Update comment for the table
COMMENT ON COLUMN subscriptions.previous_billing IS 'Stores the old billing date for overdue subscriptions that have been automatically moved forward by 30 days';
