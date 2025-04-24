/*
  # Clean up articles and ensure data consistency

  1. Changes
    - Remove orphaned article_metrics entries
    - Remove articles without proper author_id
    - Ensure all articles have corresponding metrics
    - Add NOT NULL constraints where appropriate

  2. Security
    - Maintain existing RLS policies
    - Ensure data integrity
*/

-- First, remove any orphaned metrics
DELETE FROM article_metrics
WHERE article_id NOT IN (SELECT id FROM articles);

-- Remove articles without proper author information
DELETE FROM articles
WHERE author_id IS NULL OR author_name IS NULL;

-- Ensure all articles have metrics
INSERT INTO article_metrics (article_id, views, created_at, updated_at)
SELECT 
  id as article_id,
  0 as views,
  now() as created_at,
  now() as updated_at
FROM articles
WHERE id NOT IN (SELECT article_id FROM article_metrics)
ON CONFLICT (article_id) DO NOTHING;

-- Add NOT NULL constraints
ALTER TABLE articles
  ALTER COLUMN author_name SET NOT NULL,
  ALTER COLUMN category SET NOT NULL,
  ALTER COLUMN title SET NOT NULL,
  ALTER COLUMN excerpt SET NOT NULL,
  ALTER COLUMN content SET NOT NULL,
  ALTER COLUMN image_url SET NOT NULL,
  ALTER COLUMN read_time SET NOT NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_articles_author_id ON articles(author_id);