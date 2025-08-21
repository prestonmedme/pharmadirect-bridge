-- First, add a pharmacy_id column to user_roles to link staff to their pharmacy
ALTER TABLE public.user_roles 
ADD COLUMN pharmacy_id uuid REFERENCES public.pharmacies(id);

-- Create a secure function to get user's assigned pharmacy (if they're pharmacy staff)
CREATE OR REPLACE FUNCTION public.get_user_pharmacy_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT pharmacy_id
  FROM public.user_roles
  WHERE user_id = _user_id
    AND role IN ('admin'::app_role, 'pharmacist'::app_role, 'staff'::app_role)
  LIMIT 1;
$$;

-- Create additional role types for pharmacy staff
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'pharmacist';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'staff';

-- Create a new RLS policy for pharmacy staff to view appointments at their pharmacy
CREATE POLICY "Pharmacy staff can view appointments at their pharmacy"
ON public.appointments
FOR SELECT
USING (
  -- Allow pharmacy staff to see appointments for their assigned pharmacy
  public.get_user_pharmacy_id(auth.uid()) = pharmacy_id
);

-- Create policy for pharmacy staff to update appointment status
CREATE POLICY "Pharmacy staff can update appointments at their pharmacy"
ON public.appointments
FOR UPDATE
USING (
  -- Allow pharmacy staff to update appointments for their assigned pharmacy
  public.get_user_pharmacy_id(auth.uid()) = pharmacy_id
  -- OR allow users to update their own appointments (existing functionality)
  OR auth.uid() = user_id
)
WITH CHECK (
  -- Same conditions for WITH CHECK
  public.get_user_pharmacy_id(auth.uid()) = pharmacy_id
  OR auth.uid() = user_id
);

-- Add audit logging for pharmacy staff access to sensitive data
CREATE OR REPLACE FUNCTION public.log_pharmacy_staff_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only log if accessed by pharmacy staff (not by appointment owner)
  IF auth.uid() != NEW.user_id AND public.get_user_pharmacy_id(auth.uid()) IS NOT NULL THEN
    INSERT INTO public.appointment_audit_log (
      appointment_id,
      user_id,
      action,
      accessed_fields
    ) VALUES (
      NEW.id,
      auth.uid(),
      'PHARMACY_STAFF_ACCESS',
      ARRAY['patient_name', 'patient_phone', 'patient_email', 'service_type', 'notes']
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for audit logging on SELECT operations
-- Note: We'll implement this through the application layer for SELECT operations
-- since PostgreSQL doesn't support SELECT triggers directly

-- Add index for performance on pharmacy staff queries
CREATE INDEX IF NOT EXISTS idx_user_roles_pharmacy_id ON public.user_roles(pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_appointments_pharmacy_id ON public.appointments(pharmacy_id);