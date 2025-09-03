-- Create user analytics events table
CREATE TABLE public.user_analytics_events (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL,
    user_id UUID,
    event_type TEXT NOT NULL,
    service_type TEXT,
    pharmacy_id UUID,
    is_medme_pharmacy BOOLEAN DEFAULT false,
    event_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pharmacy impressions table
CREATE TABLE public.pharmacy_impressions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    pharmacy_id UUID NOT NULL,
    impression_type TEXT NOT NULL,
    is_medme_pharmacy BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pharmacies table for US market
CREATE TABLE public.pharmacies (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    phone TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    services TEXT[],
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create MedMe pharmacies table
CREATE TABLE public.medme_pharmacies (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    pharmacy_id UUID NOT NULL REFERENCES public.pharmacies(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacy_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medme_pharmacies ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (analytics should be accessible)
CREATE POLICY "Analytics events are publicly readable" 
ON public.user_analytics_events 
FOR SELECT 
USING (true);

CREATE POLICY "Pharmacy impressions are publicly readable" 
ON public.pharmacy_impressions 
FOR SELECT 
USING (true);

CREATE POLICY "Pharmacies are publicly readable" 
ON public.pharmacies 
FOR SELECT 
USING (true);

CREATE POLICY "MedMe pharmacies are publicly readable" 
ON public.medme_pharmacies 
FOR SELECT 
USING (true);

-- Create indexes for better query performance
CREATE INDEX idx_user_analytics_events_session_id ON public.user_analytics_events(session_id);
CREATE INDEX idx_user_analytics_events_event_type ON public.user_analytics_events(event_type);
CREATE INDEX idx_user_analytics_events_created_at ON public.user_analytics_events(created_at);
CREATE INDEX idx_pharmacy_impressions_pharmacy_id ON public.pharmacy_impressions(pharmacy_id);
CREATE INDEX idx_pharmacy_impressions_created_at ON public.pharmacy_impressions(created_at);
CREATE INDEX idx_pharmacies_city_state ON public.pharmacies(city, state);
CREATE INDEX idx_pharmacies_zip_code ON public.pharmacies(zip_code);