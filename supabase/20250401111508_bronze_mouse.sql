/*
  # Add admin field and fix metrics

  1. Changes
    - Add isAdmin field to auth.users
    - Add unique constraint to article_metrics
    - Add trigger for new users to set isAdmin false by default

  2. Security
    - Only admins can update other users' admin status
    - Metrics are properly tracked per article
*/

-- Add isAdmin field to users
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Create unique constraint on article_metrics
ALTER TABLE article_metrics DROP CONSTRAINT IF EXISTS article_metrics_article_id_key;
ALTER TABLE article_metrics ADD CONSTRAINT article_metrics_article_id_key UNIQUE (article_id);

-- Function to set default admin status
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  UPDATE auth.users SET is_admin = false WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to toggle admin status (only admins can use this)
CREATE OR REPLACE FUNCTION toggle_admin_status(user_id UUID, new_status BOOLEAN)
RETURNS BOOLEAN AS $$
BEGIN
  IF (SELECT is_admin FROM auth.users WHERE id = auth.uid()) THEN
    UPDATE auth.users SET is_admin = new_status WHERE id = user_id;
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;