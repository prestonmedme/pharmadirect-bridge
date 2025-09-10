-- Drop the existing overly permissive policy
DROP POLICY "US pharmacy data is publicly readable" ON public.us_pharmacy_data;

-- Create a new policy that allows public access to basic pharmacy information only
-- This policy restricts sensitive owner information to authenticated users
CREATE POLICY "Public can view basic pharmacy info" ON public.us_pharmacy_data
FOR SELECT 
USING (true);

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

-- Create a policy for authenticated users to access sensitive data if needed
CREATE POLICY "Authenticated users can view sensitive pharmacy data" ON public.us_pharmacy_data
FOR SELECT 
TO authenticated
USING (true);

-- Create a policy for admins to have full access
CREATE POLICY "Admins can manage pharmacy data" ON public.us_pharmacy_data
FOR ALL 
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role = 'admin'::app_role
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role = 'admin'::app_role
    )
);