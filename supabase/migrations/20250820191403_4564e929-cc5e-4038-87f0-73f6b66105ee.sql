-- Create pharmacy Google Places cache table
CREATE TABLE public.pharmacy_google_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  place_id TEXT NOT NULL UNIQUE,
  pharmacy_id UUID REFERENCES public.pharmacies(id) ON DELETE CASCADE,
  name TEXT,
  formatted_address TEXT,
  phone_number TEXT,
  website TEXT,
  rating DECIMAL(2,1),
  user_ratings_total INTEGER,
  price_level INTEGER,
  business_status TEXT,
  opening_hours JSONB,
  photos JSONB,
  reviews JSONB,
  geometry JSONB,
  types TEXT[],
  plus_code JSONB,
  utc_offset INTEGER,
  vicinity TEXT,
  permanently_closed BOOLEAN DEFAULT false,
  cached_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '24 hours'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pharmacy photos table for detailed photo management
CREATE TABLE public.pharmacy_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pharmacy_id UUID REFERENCES public.pharmacies(id) ON DELETE CASCADE,
  place_id TEXT NOT NULL,
  photo_reference TEXT NOT NULL,
  google_photo_url TEXT,
  cached_photo_url TEXT,
  width INTEGER,
  height INTEGER,
  html_attributions TEXT[],
  photo_type TEXT DEFAULT 'general', -- 'general', 'exterior', 'interior'
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pharmacy reviews cache table
CREATE TABLE public.pharmacy_reviews_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pharmacy_id UUID REFERENCES public.pharmacies(id) ON DELETE CASCADE,
  place_id TEXT NOT NULL,
  google_review_id TEXT,
  author_name TEXT,
  author_url TEXT,
  profile_photo_url TEXT,
  rating INTEGER,
  relative_time_description TEXT,
  review_text TEXT,
  review_time TIMESTAMP WITH TIME ZONE,
  language TEXT,
  is_featured BOOLEAN DEFAULT false,
  cached_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_pharmacy_google_cache_place_id ON public.pharmacy_google_cache(place_id);
CREATE INDEX idx_pharmacy_google_cache_pharmacy_id ON public.pharmacy_google_cache(pharmacy_id);
CREATE INDEX idx_pharmacy_google_cache_expires_at ON public.pharmacy_google_cache(expires_at);
CREATE INDEX idx_pharmacy_photos_pharmacy_id ON public.pharmacy_photos(pharmacy_id);
CREATE INDEX idx_pharmacy_photos_place_id ON public.pharmacy_photos(place_id);
CREATE INDEX idx_pharmacy_reviews_pharmacy_id ON public.pharmacy_reviews_cache(pharmacy_id);
CREATE INDEX idx_pharmacy_reviews_place_id ON public.pharmacy_reviews_cache(place_id);

-- Enable RLS on all new tables
ALTER TABLE public.pharmacy_google_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacy_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacy_reviews_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pharmacy_google_cache
CREATE POLICY "Google cache data is viewable by everyone" 
ON public.pharmacy_google_cache 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage Google cache" 
ON public.pharmacy_google_cache 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for pharmacy_photos
CREATE POLICY "Pharmacy photos are viewable by everyone" 
ON public.pharmacy_photos 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage pharmacy photos" 
ON public.pharmacy_photos 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for pharmacy_reviews_cache
CREATE POLICY "Pharmacy reviews are viewable by everyone" 
ON public.pharmacy_reviews_cache 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage pharmacy reviews" 
ON public.pharmacy_reviews_cache 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Create function to get fresh Google Places data or cached if recent
CREATE OR REPLACE FUNCTION public.get_pharmacy_google_data(pharmacy_place_id TEXT)
RETURNS TABLE(
  id UUID,
  place_id TEXT,
  name TEXT,
  formatted_address TEXT,
  phone_number TEXT,
  website TEXT,
  rating DECIMAL,
  user_ratings_total INTEGER,
  business_status TEXT,
  opening_hours JSONB,
  photos JSONB,
  is_cached BOOLEAN,
  cached_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Return cached data if it exists and hasn't expired
  RETURN QUERY
  SELECT 
    pgc.id,
    pgc.place_id,
    pgc.name,
    pgc.formatted_address,
    pgc.phone_number,
    pgc.website,
    pgc.rating,
    pgc.user_ratings_total,
    pgc.business_status,
    pgc.opening_hours,
    pgc.photos,
    true as is_cached,
    pgc.cached_at
  FROM public.pharmacy_google_cache pgc
  WHERE pgc.place_id = pharmacy_place_id 
    AND pgc.expires_at > now()
  LIMIT 1;
END;
$$;

-- Create function to clean expired cache entries
CREATE OR REPLACE FUNCTION public.cleanup_expired_google_cache()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete expired cache entries
  DELETE FROM public.pharmacy_google_cache 
  WHERE expires_at < now();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Also clean up orphaned photos and reviews
  DELETE FROM public.pharmacy_photos 
  WHERE place_id NOT IN (
    SELECT place_id FROM public.pharmacy_google_cache
  );
  
  DELETE FROM public.pharmacy_reviews_cache 
  WHERE place_id NOT IN (
    SELECT place_id FROM public.pharmacy_google_cache
  );
  
  RETURN deleted_count;
END;
$$;

-- Create function to get pharmacy with Google data
CREATE OR REPLACE FUNCTION public.get_enhanced_pharmacy_data(pharmacy_uuid UUID)
RETURNS TABLE(
  id UUID,
  name TEXT,
  address TEXT,
  phone TEXT,
  website TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  google_place_id TEXT,
  google_rating DECIMAL,
  google_reviews_total INTEGER,
  google_business_status TEXT,
  google_opening_hours JSONB,
  photo_count INTEGER,
  last_synced TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.address,
    p.phone,
    p.website,
    p.latitude,
    p.longitude,
    pgc.place_id as google_place_id,
    pgc.rating as google_rating,
    pgc.user_ratings_total as google_reviews_total,
    pgc.business_status as google_business_status,
    pgc.opening_hours as google_opening_hours,
    COALESCE(photo_counts.photo_count, 0)::INTEGER as photo_count,
    pgc.cached_at as last_synced
  FROM public.pharmacies p
  LEFT JOIN public.pharmacy_google_cache pgc ON pgc.pharmacy_id = p.id
  LEFT JOIN (
    SELECT pharmacy_id, COUNT(*) as photo_count
    FROM public.pharmacy_photos
    GROUP BY pharmacy_id
  ) photo_counts ON photo_counts.pharmacy_id = p.id
  WHERE p.id = pharmacy_uuid;
END;
$$;

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_pharmacy_google_cache_updated_at
  BEFORE UPDATE ON public.pharmacy_google_cache
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pharmacy_photos_updated_at
  BEFORE UPDATE ON public.pharmacy_photos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pharmacy_reviews_cache_updated_at
  BEFORE UPDATE ON public.pharmacy_reviews_cache
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();