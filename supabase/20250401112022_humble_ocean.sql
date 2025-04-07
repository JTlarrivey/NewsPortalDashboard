/*
  # Update users view to include admin status

  1. Changes
    - Update public.users view to include is_admin field
    - Maintain existing permissions

  2. Security
    - Only expose necessary user information through the view
    - Maintain existing access controls
*/

-- Update the users view to include is_admin
CREATE OR REPLACE VIEW public.users AS 
SELECT id, email, is_admin
FROM auth.users;

-- Ensure permissions are set correctly
GRANT SELECT ON public.users TO authenticated;
GRANT SELECT ON public.users TO anon;