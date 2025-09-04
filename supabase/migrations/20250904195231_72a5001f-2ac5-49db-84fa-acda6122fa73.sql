-- Enable public read access to US pharmacies data
CREATE POLICY "US pharmacies are publicly readable"
ON public.us_pharmacies_raw
FOR SELECT
USING (true);