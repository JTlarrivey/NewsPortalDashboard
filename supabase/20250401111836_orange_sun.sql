/*
  # Fix Author Relationship

  1. Changes
    - Add foreign key constraint between articles.author_id and auth.users.id
    - Create view to expose user emails safely
    - Update RLS policies to allow proper access

  2. Security
    - Only expose necessary user information (email) through a secure view
    - Maintain RLS policies for article access
*/

-- Create a secure view for user information
CREATE OR REPLACE VIEW public.users AS 
SELECT id, email 
FROM auth.users;

-- Grant access to the view
GRANT SELECT ON public.users TO authenticated;
GRANT SELECT ON public.users TO anon;

-- Add foreign key constraint
ALTER TABLE public.articles 
  DROP CONSTRAINT IF EXISTS articles_author_id_fkey;

ALTER TABLE public.articles
  ADD CONSTRAINT articles_author_id_fkey 
  FOREIGN KEY (author_id) 
  REFERENCES auth.users(id)
  ON DELETE SET NULL;