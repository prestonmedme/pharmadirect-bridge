-- Enable RLS on us_pharmacy_data table
ALTER TABLE public.us_pharmacy_data ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to us_pharmacy_data
CREATE POLICY "US pharmacy data is publicly readable" 
ON public.us_pharmacy_data 
FOR SELECT 
USING (true);