-- Make medme_pharmacies data private with admin-only access

-- Drop the existing public policy that allows anyone to read
DROP POLICY IF EXISTS "MedMe pharmacies are publicly readable" ON public.medme_pharmacies;

-- Create admin-only policies for medme_pharmacies
CREATE POLICY "Admins can select all medme pharmacies"
ON public.medme_pharmacies
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert medme pharmacies"
ON public.medme_pharmacies
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update medme pharmacies"
ON public.medme_pharmacies
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete medme pharmacies"
ON public.medme_pharmacies
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));