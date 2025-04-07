/*
  # Fix Article View Counter

  1. Changes
    - Update increment_article_views function to properly handle initial record creation
    - Add index on article_metrics views column for better performance
    - Ensure proper cascade deletion

  2. Security
    - Maintain existing RLS policies
    - Function remains security definer for proper access
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS increment_article_views(uuid);

-- Create improved function
CREATE OR REPLACE FUNCTION increment_article_views(article_id_param uuid)
RETURNS void AS $$
BEGIN
  -- First try to update existing record
  UPDATE article_metrics 
  SET 
    views = COALESCE(views, 0) + 1,
    updated_at = now()
  WHERE article_id = article_id_param;
  
  -- If no record exists, create one
  IF NOT FOUND THEN
    INSERT INTO article_metrics (article_id, views, created_at, updated_at)
    VALUES (article_id_param, 1, now(), now())
    ON CONFLICT (article_id) DO UPDATE
    SET 
      views = COALESCE(article_metrics.views, 0) + 1,
      updated_at = now();
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_article_metrics_views ON article_metrics(views DESC);

-- Ensure proper cascade deletion
ALTER TABLE article_metrics
  DROP CONSTRAINT IF EXISTS article_metrics_article_id_fkey,
  ADD CONSTRAINT article_metrics_article_id_fkey
  FOREIGN KEY (article_id)
  REFERENCES articles(id)
  ON DELETE CASCADE;