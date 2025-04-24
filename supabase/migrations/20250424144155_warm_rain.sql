/*
  # Add popup position to ads table

  1. Changes
    - Update position check constraint to include 'popup' option
    - Ensure backward compatibility with existing ads

  2. Security
    - Maintain existing RLS policies
*/

-- Drop existing check constraint
ALTER TABLE ads DROP CONSTRAINT IF EXISTS ads_position_check;

-- Add new check constraint with popup option
ALTER TABLE ads
  ADD CONSTRAINT ads_position_check 
  CHECK (position = ANY (ARRAY['side'::text, 'bottom'::text, 'popup'::text]));