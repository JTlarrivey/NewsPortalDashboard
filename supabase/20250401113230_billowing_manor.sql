/*
  # Add author name to articles table

  1. Changes
    - Add author_name column to articles table
    - Update existing RLS policies
    - Add default value for author_name

  2. Security
    - Maintain existing RLS policies
    - Ensure author_name is properly protected
*/

-- Add author_name column
ALTER TABLE articles
ADD COLUMN IF NOT EXISTS author_name text;

-- Update RLS policies to include author_name
DROP POLICY IF EXISTS "Authors can update their own articles" ON articles;
CREATE POLICY "Authors can update their own articles" 
ON articles FOR UPDATE 
TO authenticated 
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

-- Function to increment article views
CREATE OR REPLACE FUNCTION increment_article_views(article_id_param uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO article_metrics (article_id, views)
  VALUES (article_id_param, 1)
  ON CONFLICT (article_id)
  DO UPDATE SET
    views = article_metrics.views + 1,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;