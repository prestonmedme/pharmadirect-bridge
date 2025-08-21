-- Fix security issue: Restrict medme_pharmacies access to authenticated users only
-- This prevents public scraping of pharmacy phone numbers and addresses
-- while still allowing legitimate app users to search for pharmacies

-- Drop the current public policy
DROP POLICY IF EXISTS "MedMe pharmacies are viewable by everyone" ON public.medme_pharmacies;

-- Create new policy that requires authentication
CREATE POLICY "Authenticated users can view MedMe pharmacies"
ON public.medme_pharmacies
FOR SELECT
TO authenticated
USING (true);

-- Add comment for documentation
COMMENT ON POLICY "Authenticated users can view MedMe pharmacies" ON public.medme_pharmacies 
IS 'Restricts pharmacy data access to authenticated users to prevent public scraping of sensitive business information';