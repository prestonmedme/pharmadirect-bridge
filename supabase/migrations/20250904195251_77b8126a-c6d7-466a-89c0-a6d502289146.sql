-- Enable Row Level Security on us_pharmacies_raw table
ALTER TABLE public.us_pharmacies_raw ENABLE ROW LEVEL SECURITY;

-- Recreate the policy now that RLS is enabled
CREATE POLICY "US pharmacies are publicly readable"
ON public.us_pharmacies_raw
FOR SELECT
USING (true);