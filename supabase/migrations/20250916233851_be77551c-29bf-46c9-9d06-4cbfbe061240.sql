-- Create Canadian pharmacy data table
CREATE TABLE public.ca_pharmacy_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medme_id TEXT UNIQUE NOT NULL, -- Store the original CSV id
  name TEXT NOT NULL,
  tenant_id UUID,
  store_no TEXT,
  enterprise TEXT,
  domain TEXT,
  province TEXT NOT NULL,
  time_zone TEXT,
  website TEXT,
  address_unit TEXT,
  address_street_number TEXT,
  address_street_name TEXT,
  address_city TEXT NOT NULL,
  address_province TEXT,
  address_postal_code TEXT,
  address_po_box TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  street_address TEXT,
  address_country TEXT DEFAULT 'Canada',
  google_place_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ca_pharmacy_data ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (similar to us_pharmacy_data)
CREATE POLICY "Canadian pharmacy data is publicly readable" 
ON public.ca_pharmacy_data 
FOR SELECT 
USING (true);

-- Create policy for admin management
CREATE POLICY "Admins can manage Canadian pharmacy data" 
ON public.ca_pharmacy_data 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for better performance
CREATE INDEX idx_ca_pharmacy_data_province ON public.ca_pharmacy_data(province);
CREATE INDEX idx_ca_pharmacy_data_city ON public.ca_pharmacy_data(address_city);
CREATE INDEX idx_ca_pharmacy_data_location ON public.ca_pharmacy_data(lat, lng);
CREATE INDEX idx_ca_pharmacy_data_medme_id ON public.ca_pharmacy_data(medme_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ca_pharmacy_data_updated_at
BEFORE UPDATE ON public.ca_pharmacy_data
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();