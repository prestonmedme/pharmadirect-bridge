-- Fix the function search path security issue
CREATE OR REPLACE FUNCTION public.get_public_pharmacy_data()
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
    updated_at timestamp with time zone
)
LANGUAGE sql
SECURITY INVOKER
STABLE
SET search_path = public
AS $$
    SELECT 
        u.id,
        u.name,
        u.address,
        u.phone,
        u.lat,
        u.lng,
        u.zip_code,
        u.state_name,
        u.ratings,
        u.score,
        u.opening_hours,
        u.website,
        u.healthcare_services,
        u.immunizations_vaccinations,
        u.health_screenings_point_of_care,
        u.specialized_health_programs,
        u.clinical_services,
        u.clinical_services_summary,
        u.clinical_services_lowercase,
        u.immunizations,
        u.clinical_services_2,
        u.booking_link,
        u.main_image_url,
        u.category,
        u.is_a_pharmacy,
        u.created_at,
        u.updated_at
    FROM public.us_pharmacy_data u;
$$;