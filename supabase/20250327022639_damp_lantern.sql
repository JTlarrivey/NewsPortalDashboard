/*
  # Update Articles Table RLS Policies

  1. Changes
    - Enable RLS on articles table
    - Add policies for:
      - Public read access to all articles
      - Authenticated users can create articles
      - Authors can update their own articles
      - Authors can delete their own articles

  2. Security
    - Everyone can read articles
    - Only authenticated users can create articles
    - Authors can only modify their own articles
*/

-- Enable RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Articles are viewable by everyone" ON articles;
DROP POLICY IF EXISTS "Authors can insert articles" ON articles;
DROP POLICY IF EXISTS "Authors can update their own articles" ON articles;
DROP POLICY IF EXISTS "Authors can delete their own articles" ON articles;

-- Create new policies
CREATE POLICY "Articles are viewable by everyone" 
ON articles FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Authors can insert articles" 
ON articles FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own articles" 
ON articles FOR UPDATE 
TO authenticated 
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own articles" 
ON articles FOR DELETE 
TO authenticated 
USING (auth.uid() = author_id);