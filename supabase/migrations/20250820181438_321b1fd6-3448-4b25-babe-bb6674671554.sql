-- Create brand configurations table
CREATE TABLE public.brand_configurations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  logo_url text,
  favicon_url text,
  primary_color text NOT NULL DEFAULT '#007acc',
  secondary_color text NOT NULL DEFAULT '#00b2a9',
  font_family text NOT NULL DEFAULT 'Inter, sans-serif',
  cta_style text NOT NULL DEFAULT 'rounded' CHECK (cta_style IN ('rounded', 'pill', 'block')),
  gradient_enabled boolean NOT NULL DEFAULT true,
  gradient_start_color text,
  gradient_end_color text,
  custom_css text,
  is_active boolean NOT NULL DEFAULT false,
  domain_mapping text[],
  subdomain_mapping text[],
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

-- Create brand templates table
CREATE TABLE public.brand_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'general',
  logo_url text,
  primary_color text NOT NULL,
  secondary_color text NOT NULL,
  font_family text NOT NULL,
  cta_style text NOT NULL DEFAULT 'rounded' CHECK (cta_style IN ('rounded', 'pill', 'block')),
  gradient_enabled boolean NOT NULL DEFAULT true,
  gradient_start_color text,
  gradient_end_color text,
  preview_image_url text,
  is_public boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create brand audit log table
CREATE TABLE public.brand_audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_config_id uuid NOT NULL REFERENCES public.brand_configurations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  action text NOT NULL,
  changes jsonb,
  previous_values jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.brand_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for brand_configurations
CREATE POLICY "Admins can manage all brand configurations" 
ON public.brand_configurations 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Everyone can view active brand configurations" 
ON public.brand_configurations 
FOR SELECT 
USING (is_active = true);

-- RLS Policies for brand_templates
CREATE POLICY "Admins can manage all brand templates" 
ON public.brand_templates 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Everyone can view public brand templates" 
ON public.brand_templates 
FOR SELECT 
USING (is_public = true);

-- RLS Policies for brand_audit_log
CREATE POLICY "Admins can view all brand audit logs" 
ON public.brand_audit_log 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert brand audit logs" 
ON public.brand_audit_log 
FOR INSERT 
WITH CHECK (true);

-- Create triggers for updated_at columns
CREATE TRIGGER update_brand_configurations_updated_at
  BEFORE UPDATE ON public.brand_configurations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default brand templates
INSERT INTO public.brand_templates (name, description, category, primary_color, secondary_color, font_family, cta_style, gradient_enabled, gradient_start_color, gradient_end_color) VALUES
('Medical Blue', 'Professional medical theme with calming blue tones', 'healthcare', '#007acc', '#00b2a9', 'Inter, sans-serif', 'rounded', true, '#007acc', '#00b2a9'),
('Pharmacy Red', 'Bold pharmacy theme with red accents', 'pharmacy', '#8B0000', '#FFD700', 'Roboto, sans-serif', 'rounded', true, '#8B0000', '#FFD700'),
('Healthcare Green', 'Natural healthcare theme with green palette', 'healthcare', '#2E8B57', '#90EE90', 'Lato, sans-serif', 'pill', true, '#2E8B57', '#90EE90'),
('Corporate Navy', 'Professional corporate theme with navy blue', 'corporate', '#1e3a8a', '#3b82f6', 'Inter, sans-serif', 'block', true, '#1e3a8a', '#3b82f6'),
('Wellness Purple', 'Calming wellness theme with purple accents', 'wellness', '#6366f1', '#a855f7', 'Poppins, sans-serif', 'pill', true, '#6366f1', '#a855f7');

-- Insert default active brand configuration
INSERT INTO public.brand_configurations (
  name, 
  description, 
  logo_url,
  primary_color, 
  secondary_color, 
  font_family, 
  cta_style, 
  gradient_enabled, 
  gradient_start_color, 
  gradient_end_color,
  is_active,
  domain_mapping,
  subdomain_mapping
) VALUES (
  'Default MedMe Theme',
  'Default brand configuration for MedMe platform',
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTAwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0ZXh0IHg9IjEwIiB5PSIyNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjMDA3YWNjIj5NZWRNZTwvdGV4dD48L3N2Zz4=',
  '#007acc',
  '#00b2a9',
  'Inter, sans-serif',
  'rounded',
  true,
  '#007acc',
  '#00b2a9',
  true,
  ARRAY['localhost:8080', 'medme.lovable.app'],
  ARRAY['default']
);