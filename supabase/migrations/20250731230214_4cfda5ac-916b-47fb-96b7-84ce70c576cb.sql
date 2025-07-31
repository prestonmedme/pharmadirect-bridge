-- Create RLS policies for medme_pharmacies table to allow public read access
-- This is needed for the pharmacy directory functionality

CREATE POLICY "MedMe pharmacies are viewable by everyone" 
ON public.medme_pharmacies 
FOR SELECT 
USING (true);