-- Insert Preston's Pills into the pharmacies table first
INSERT INTO public.pharmacies (
  name,
  address,
  city,
  state,
  zip_code,
  phone,
  latitude,
  longitude,
  services
) VALUES (
  'Preston''s Pills',
  '851 California St',
  'San Francisco',
  'CA',
  '94108',
  '(415) 555-0123',
  37.7919,
  -122.4074,
  ARRAY['COVID-19 vaccines', 'Flu shots', 'Travel vaccines', 'Blood pressure monitoring', 'Medication consultations']
);

-- Then insert Preston's Pills into us_pharmacy_data with more detailed information
INSERT INTO public.us_pharmacy_data (
  name,
  address,
  lat,
  lng,
  phone,
  website,
  ratings,
  score,
  opening_hours,
  state_name,
  zip_code,
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
  category,
  is_a_pharmacy,
  main_image_url
) VALUES (
  'Preston''s Pills',
  '851 California St, San Francisco, CA 94108',
  37.7919,
  -122.4074,
  '(415) 555-0123',
  'https://prestonspills.com',
  4.8,
  95.0,
  'Mon-Fri: 8:00 AM - 8:00 PM, Sat: 9:00 AM - 6:00 PM, Sun: 10:00 AM - 4:00 PM',
  'California',
  94108,
  'Prescription medications, Over-the-counter drugs, Health consultations',
  'COVID-19 vaccines, Flu shots, Travel vaccines, Hepatitis vaccines',
  'Blood pressure monitoring, Cholesterol screening, Diabetes testing',
  'Medication therapy management, Chronic disease management',
  'Immunizations, Health screenings, Medication consultations, Prescription refills',
  'Full-service pharmacy offering immunizations, health screenings, and medication management',
  'immunizations, health screenings, medication consultations, prescription refills',
  'COVID-19 vaccines, Flu shots, Travel vaccines, Hepatitis vaccines, Shingles vaccine',
  'Immunizations, Health screenings, Medication consultations',
  'https://prestonspills.com/book-appointment',
  'Independent Pharmacy',
  'Yes',
  '/medme-logo.png'
);

-- Now create MedMe connection using the pharmacy from the pharmacies table
DO $$
DECLARE
    pharmacy_uuid uuid;
BEGIN
    -- Get the pharmacy ID from the pharmacies table
    SELECT id INTO pharmacy_uuid 
    FROM public.pharmacies 
    WHERE name = 'Preston''s Pills' AND city = 'San Francisco';
    
    -- Insert into medme_pharmacies table to mark it as a MedMe pharmacy
    INSERT INTO public.medme_pharmacies (pharmacy_id, is_active)
    VALUES (pharmacy_uuid, true);
END $$;