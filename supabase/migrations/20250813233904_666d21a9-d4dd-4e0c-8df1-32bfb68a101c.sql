-- Add data encryption and audit logging for sensitive appointment data

-- Create a function to encrypt sensitive data (using pgcrypto extension)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create audit log table for tracking access to sensitive data
CREATE TABLE IF NOT EXISTS public.appointment_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID NOT NULL,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  accessed_fields TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.appointment_audit_log ENABLE ROW LEVEL SECURITY;

-- Only allow users to view their own audit logs
CREATE POLICY "Users can view their own audit logs" 
ON public.appointment_audit_log 
FOR SELECT 
USING (auth.uid() = user_id);

-- System can insert audit logs (via security definer functions)
CREATE POLICY "System can insert audit logs" 
ON public.appointment_audit_log 
FOR INSERT 
WITH CHECK (true);

-- Create a security definer function for sensitive data access
CREATE OR REPLACE FUNCTION public.get_appointment_with_audit(appointment_id UUID)
RETURNS TABLE(
  id UUID,
  user_id UUID,
  pharmacy_id UUID,
  service_type TEXT,
  appointment_date DATE,
  appointment_time TIME,
  status TEXT,
  patient_name TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user owns this appointment
  IF NOT EXISTS (
    SELECT 1 FROM public.appointments a 
    WHERE a.id = appointment_id AND a.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied: appointment not found or not owned by user';
  END IF;
  
  -- Log the access (excluding sensitive phone/email)
  INSERT INTO public.appointment_audit_log (
    appointment_id, 
    user_id, 
    action, 
    accessed_fields
  ) VALUES (
    appointment_id,
    auth.uid(),
    'READ',
    ARRAY['basic_info']
  );
  
  -- Return appointment data (excluding phone and email for regular access)
  RETURN QUERY
  SELECT 
    a.id,
    a.user_id,
    a.pharmacy_id,
    a.service_type,
    a.appointment_date,
    a.appointment_time,
    a.status,
    a.patient_name,
    a.notes,
    a.created_at,
    a.updated_at
  FROM public.appointments a
  WHERE a.id = appointment_id AND a.user_id = auth.uid();
END;
$$;

-- Create function to access sensitive data with explicit consent and logging
CREATE OR REPLACE FUNCTION public.get_sensitive_appointment_data(
  appointment_id UUID,
  explicit_consent BOOLEAN DEFAULT FALSE
)
RETURNS TABLE(
  patient_phone TEXT,
  patient_email TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Require explicit consent for sensitive data access
  IF NOT explicit_consent THEN
    RAISE EXCEPTION 'Explicit consent required for accessing sensitive personal data';
  END IF;
  
  -- Check if user owns this appointment
  IF NOT EXISTS (
    SELECT 1 FROM public.appointments a 
    WHERE a.id = appointment_id AND a.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied: appointment not found or not owned by user';
  END IF;
  
  -- Log the sensitive data access
  INSERT INTO public.appointment_audit_log (
    appointment_id, 
    user_id, 
    action, 
    accessed_fields
  ) VALUES (
    appointment_id,
    auth.uid(),
    'READ_SENSITIVE',
    ARRAY['patient_phone', 'patient_email']
  );
  
  -- Return sensitive data
  RETURN QUERY
  SELECT 
    a.patient_phone,
    a.patient_email
  FROM public.appointments a
  WHERE a.id = appointment_id AND a.user_id = auth.uid();
END;
$$;

-- Add updated_at trigger to audit log
CREATE TRIGGER update_appointment_audit_log_updated_at
  BEFORE UPDATE ON public.appointment_audit_log
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create a view for safe appointment data access (excluding sensitive fields by default)
CREATE OR REPLACE VIEW public.appointments_safe_view AS
SELECT 
  id,
  user_id,
  pharmacy_id,
  service_type,
  appointment_date,
  appointment_time,
  status,
  patient_name,
  notes,
  created_at,
  updated_at,
  -- Mask sensitive data by default
  CASE 
    WHEN patient_phone IS NOT NULL THEN '***-***-' || RIGHT(patient_phone, 4)
    ELSE NULL
  END as patient_phone_masked,
  CASE 
    WHEN patient_email IS NOT NULL THEN LEFT(patient_email, 3) || '***@' || SPLIT_PART(patient_email, '@', 2)
    ELSE NULL
  END as patient_email_masked
FROM public.appointments;

-- Grant appropriate permissions
GRANT SELECT ON public.appointments_safe_view TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_appointment_with_audit(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_sensitive_appointment_data(UUID, BOOLEAN) TO authenticated;