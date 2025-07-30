-- Add RLS policies for pharmacies table (public read access since pharmacies are public information)
CREATE POLICY "Pharmacies are viewable by everyone" 
ON public.pharmacies 
FOR SELECT 
USING (true);

-- Pharmacies can only be managed by authenticated users (for future admin functionality)
CREATE POLICY "Authenticated users can insert pharmacies" 
ON public.pharmacies 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update pharmacies" 
ON public.pharmacies 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete pharmacies" 
ON public.pharmacies 
FOR DELETE 
USING (auth.uid() IS NOT NULL);