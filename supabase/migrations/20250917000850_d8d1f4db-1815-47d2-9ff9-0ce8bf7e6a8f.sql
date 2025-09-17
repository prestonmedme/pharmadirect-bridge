-- Drop existing table that doesn't match CSV structure
DROP TABLE IF EXISTS public.ca_pharmacy_data;

-- Extensions (safe to run multiple times)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- PostGIS optional; comment out if not needed now
-- CREATE EXTENSION IF NOT EXISTS postgis;

-- Normalizer function (IMMUTABLE) for Canada provinces
-- Maps messy values (e.g., "Ontario", "PQ", "SK ") to 2-letter codes; returns NULL when unknown.
CREATE OR REPLACE FUNCTION normalize_ca_province(prov text, addr_prov text)
RETURNS char(2)
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE UPPER(TRIM(COALESCE(prov, addr_prov)))
    WHEN 'ON' THEN 'ON' WHEN 'ONTARIO' THEN 'ON'
    WHEN 'QC' THEN 'QC' WHEN 'PQ' THEN 'QC' WHEN 'QUEBEC' THEN 'QC'
    WHEN 'AB' THEN 'AB' WHEN 'ALBERTA' THEN 'AB'
    WHEN 'BC' THEN 'BC' WHEN 'BRITISH COLUMBIA' THEN 'BC'
    WHEN 'NS' THEN 'NS' WHEN 'NOVA SCOTIA' THEN 'NS'
    WHEN 'NB' THEN 'NB' WHEN 'NEW BRUNSWICK' THEN 'NB'
    WHEN 'MB' THEN 'MB' WHEN 'MANITOBA' THEN 'MB'
    WHEN 'SK' THEN 'SK' WHEN 'SASKATCHEWAN' THEN 'SK'
    WHEN 'NL' THEN 'NL' WHEN 'NEWFOUNDLAND' THEN 'NL'
    WHEN 'PE' THEN 'PE' WHEN 'PEI' THEN 'PE' WHEN 'PRINCE EDWARD ISLAND' THEN 'PE'
    WHEN 'YT' THEN 'YT' WHEN 'YUKON' THEN 'YT'
    WHEN 'NT' THEN 'NT' WHEN 'NORTHWEST TERRITORIES' THEN 'NT'
    WHEN 'NU' THEN 'NU' WHEN 'NUNAVUT' THEN 'NU'
    ELSE NULL
  END
$$;

-- Main table — column names match CSV headers exactly
-- Table name: pharmacies_ca (Canada dataset).
-- Note: Columns with spaces are quoted to match the CSV headers.
CREATE TABLE IF NOT EXISTS public.pharmacies_ca (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  tenant_id uuid NOT NULL,
  store_no text,
  enterprise text,
  domain text,
  province text NOT NULL,
  time_zone text,
  website text,

  "Pharmacy Address__unit" text,
  "Pharmacy Address__street_number" text,
  "Pharmacy Address__street_name" text,
  "Pharmacy Address__city" text,
  "Pharmacy Address__province" text,
  "Pharmacy Address__postal_code" text,
  "Pharmacy Address__po_box" text,
  "Pharmacy Address__latitude" double precision,
  "Pharmacy Address__longitude" double precision,
  "Pharmacy Address__street_address" text,
  "Pharmacy Address__country" text,

  google_place_id text,

  -- Generated helpers (not in CSV; auto-filled on insert)
  province_code char(2) GENERATED ALWAYS AS (
    normalize_ca_province(province, "Pharmacy Address__province")
  ) STORED,
  
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_pharmacies_ca_province_code
  ON public.pharmacies_ca (province_code);

CREATE INDEX IF NOT EXISTS idx_pharmacies_ca_province_raw
  ON public.pharmacies_ca (province);

CREATE INDEX IF NOT EXISTS idx_pharmacies_ca_city
  ON public.pharmacies_ca ("Pharmacy Address__city");

CREATE INDEX IF NOT EXISTS idx_pharmacies_ca_name_trgm
  ON public.pharmacies_ca USING gin (name gin_trgm_ops);

-- (Optional, if you enabled PostGIS and want geosearch later)
-- ALTER TABLE public.pharmacies_ca
--   ADD COLUMN IF NOT EXISTS geog geography(point, 4326)
--   GENERATED ALWAYS AS (
--     CASE
--       WHEN "Pharmacy Address__latitude" IS NOT NULL
--         AND "Pharmacy Address__longitude" IS NOT NULL
--       THEN ST_SetSRID(ST_MakePoint("Pharmacy Address__longitude","Pharmacy Address__latitude"),4326)::geography
--       ELSE NULL
--     END
--   ) STORED;
-- CREATE INDEX IF NOT EXISTS idx_pharmacies_ca_geog ON public.pharmacies_ca USING gist (geog);

-- Enable Row Level Security
ALTER TABLE public.pharmacies_ca ENABLE ROW LEVEL SECURITY;

-- Create policies for Canadian pharmacy data
CREATE POLICY "Canadian pharmacy data is publicly readable" 
ON public.pharmacies_ca 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage Canadian pharmacy data" 
ON public.pharmacies_ca 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));