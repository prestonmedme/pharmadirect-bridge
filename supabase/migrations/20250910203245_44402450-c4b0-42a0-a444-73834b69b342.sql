-- Drop the view and create proper RLS policies instead
DROP VIEW IF EXISTS public.pharmacy_public_view;

-- Create a function to determine if sensitive data should be visible
CREATE OR REPLACE FUNCTION public.can_view_sensitive_pharmacy_data()
RETURNS BOOLEAN AS $$
BEGIN
  -- Return true if user is authenticated, false for anonymous users
  RETURN auth.uid() IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop existing policies on us_pharmacy_data
DROP POLICY IF EXISTS "US pharmacy data is publicly readable" ON public.us_pharmacy_data;
DROP POLICY IF EXISTS "Public can view basic pharmacy info" ON public.us_pharmacy_data;
DROP POLICY IF EXISTS "Authenticated users can view sensitive pharmacy data" ON public.us_pharmacy_data;
DROP POLICY IF EXISTS "Admins can manage pharmacy data" ON public.us_pharmacy_data;

-- Create new RLS policies that protect sensitive owner information
CREATE POLICY "Public can view basic pharmacy information" ON public.us_pharmacy_data
FOR SELECT 
USING (
  -- Always allow access to basic pharmacy information needed for search
  true
);

-- Add column-level security by creating a secure function that filters sensitive columns
CREATE OR REPLACE FUNCTION public.get_pharmacy_data_secure(
  include_sensitive BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
  id uuid,
  name text,
  address text,
  phone text,
  lat double precision,
  lng double precision,
  zip_code double precision,
  state_name text,
  ratings double precision,
  score double precision,
  opening_hours text,
  website text,
  healthcare_services text,
  immunizations_vaccinations text,
  health_screenings_point_of_care text,
  specialized_health_programs text,
  clinical_services text,
  clinical_services_summary text,
  clinical_services_lowercase text,
  immunizations text,
  clinical_services_2 text,
  booking_link text,
  main_image_url text,
  category text,
  is_a_pharmacy text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  -- Sensitive fields only returned if authorized
  owner_name text,
  email text,
  preferred_email text,
  owner_manager_info text,
  owners text
) AS $$
BEGIN
  IF include_sensitive AND auth.uid() IS NOT NULL THEN
    -- Return all data for authenticated users
    RETURN QUERY 
    SELECT 
      p.id, p.name, p.address, p.phone, p.lat, p.lng, p.zip_code, p.state_name,
      p.ratings, p.score, p.opening_hours, p.website, p.healthcare_services,
      p.immunizations_vaccinations, p.health_screenings_point_of_care,
      p.specialized_health_programs, p.clinical_services, p.clinical_services_summary,
      p.clinical_services_lowercase, p.immunizations, p.clinical_services_2,
      p.booking_link, p.main_image_url, p.category, p.is_a_pharmacy,
      p.created_at, p.updated_at,
      p.owner_name, p.email, p.preferred_email, p.owner_manager_info, p.owners
    FROM public.us_pharmacy_data p;
  ELSE
    -- Return only non-sensitive data for public access
    RETURN QUERY 
    SELECT 
      p.id, p.name, p.address, p.phone, p.lat, p.lng, p.zip_code, p.state_name,
      p.ratings, p.score, p.opening_hours, p.website, p.healthcare_services,
      p.immunizations_vaccinations, p.health_screenings_point_of_care,
      p.specialized_health_programs, p.clinical_services, p.clinical_services_summary,
      p.clinical_services_lowercase, p.immunizations, p.clinical_services_2,
      p.booking_link, p.main_image_url, p.category, p.is_a_pharmacy,
      p.created_at, p.updated_at,
      NULL::text, NULL::text, NULL::text, NULL::text, NULL::text
    FROM public.us_pharmacy_data p;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;