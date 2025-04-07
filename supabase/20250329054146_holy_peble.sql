/*
  # Add Metrics Table and Update Dashboard Stats

  1. New Tables
    - `article_metrics`
      - `id` (uuid, primary key)
      - `article_id` (uuid, references articles)
      - `views` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on article_metrics table
    - Add policies for:
      - Public read access
      - Authenticated users can update metrics
*/

CREATE TABLE IF NOT EXISTS article_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid REFERENCES articles(id) ON DELETE CASCADE,
  views integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE article_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Article metrics are viewable by everyone"
ON article_metrics FOR SELECT
TO public
USING (true);

CREATE POLICY "Authenticated users can update metrics"
ON article_metrics FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Function to update metrics
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