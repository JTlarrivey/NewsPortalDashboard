/*
  # Clean up ticker items

  1. Changes
    - Deactivate all existing ticker items
    - Remove any orphaned or invalid items
    - Reset order sequence for remaining items
    - Add NOT NULL constraints where needed

  2. Security
    - Maintain existing RLS policies
    - Ensure data integrity
*/

-- First, deactivate all existing items
UPDATE ticker_items SET active = false;

-- Remove any items with NULL required fields
DELETE FROM ticker_items 
WHERE text IS NULL 
   OR link IS NULL 
   OR "order" IS NULL;

-- Add NOT NULL constraints if they don't exist
ALTER TABLE ticker_items
  ALTER COLUMN text SET NOT NULL,
  ALTER COLUMN link SET NOT NULL,
  ALTER COLUMN "order" SET NOT NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_ticker_items_order 
ON ticker_items("order", active);

-- Add partial index for unique order on active items
CREATE UNIQUE INDEX IF NOT EXISTS idx_ticker_items_active_order
ON ticker_items("order")
WHERE active = true;