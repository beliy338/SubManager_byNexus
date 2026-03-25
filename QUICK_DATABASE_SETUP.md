# ⚡ Quick Database Setup (5 minutes)

## Step 1: Open Supabase SQL Editor

Click here: [https://app.supabase.com/project/echbyusirwoojodjhhzi/sql/new](https://app.supabase.com/project/echbyusirwoojodjhhzi/sql/new)

## Step 2: Copy & Paste SQL

Copy the entire content from `/supabase/migrations/001_initial_schema.sql` and paste into the SQL editor.

**Or copy this:**

```sql
-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  next_billing DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  language TEXT NOT NULL DEFAULT 'ru',
  currency TEXT NOT NULL DEFAULT 'RUB',
  font_size TEXT NOT NULL DEFAULT 'medium' CHECK (font_size IN ('small', 'medium', 'large')),
  theme TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('dark', 'light')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscriptions"
  ON subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for user_settings
CREATE POLICY "Users can view their own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_next_billing ON subscriptions(next_billing);
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for auto-updating updated_at
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Step 3: Run the Query

Click **"Run"** button (or press Ctrl/Cmd + Enter)

## Step 4: Verify

Check that tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

You should see:
- `subscriptions`
- `user_settings`

## Step 5: Test the App

1. Sign up or log in to SubManager
2. Add a subscription
3. Check sidebar - should show **"Cloud Synced"** with green ☁️ icon

## ✅ Done!

Your app now saves all data to Supabase cloud automatically!

---

**Need help?** Check `/supabase/SETUP_DATABASE.md` for detailed instructions.
