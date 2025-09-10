-- Create a view for public pharmacy data that excludes sensitive owner information
CREATE OR REPLACE VIEW public.pharmacy_public_view AS
SELECT 
    id,
    name,
    address,
    phone,
    lat,
    lng,
    zip_code,
    state_name,
    ratings,
    score,
    opening_hours,
    website,
    healthcare_services,
    immunizations_vaccinations,
    health_screenings_point_of_care,
    specialized_health_programs,
    clinical_services,
    clinical_services_summary,
    clinical_services_lowercase,
    immunizations,
    clinical_services_2,
    booking_link,
    main_image_url,
    category,
    is_a_pharmacy,
    created_at,
    updated_at
FROM public.us_pharmacy_data;

-- Grant public access to the view
GRANT SELECT ON public.pharmacy_public_view TO anon;
GRANT SELECT ON public.pharmacy_public_view TO authenticated;

-- Enable RLS on the view
ALTER VIEW public.pharmacy_public_view SET ROW SECURITY ENFORCED;

-- Create RLS policy for the public view
CREATE POLICY "Public pharmacy view access" ON public.pharmacy_public_view
FOR SELECT 
USING (true);