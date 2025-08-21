-- Create analytics tracking tables for priority metrics

-- Table for general user analytics events (searches, bookings, etc.)
CREATE TABLE public.user_analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'search', 'results_shown', 'profile_view', 'book_start', 'book_confirmed', etc.
  event_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  pharmacy_id UUID,
  service_type TEXT,
  is_medme_pharmacy BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for pharmacy-specific impression and interaction tracking
CREATE TABLE public.pharmacy_impressions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pharmacy_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  impression_type TEXT NOT NULL, -- 'view', 'click_call', 'click_directions', 'click_website', 'click_book'
  service_context TEXT, -- What service was being searched when this happened
  is_medme_pharmacy BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.user_analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacy_impressions ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Only admins can view analytics data
CREATE POLICY "Admins can view all analytics events"
ON public.user_analytics_events
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert analytics events"
ON public.user_analytics_events
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Admins can view all pharmacy impressions"
ON public.pharmacy_impressions
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert pharmacy impressions"
ON public.pharmacy_impressions
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Performance indexes
CREATE INDEX idx_user_analytics_events_type_date ON public.user_analytics_events(event_type, created_at);
CREATE INDEX idx_user_analytics_events_pharmacy ON public.user_analytics_events(pharmacy_id, created_at);
CREATE INDEX idx_user_analytics_events_service ON public.user_analytics_events(service_type, created_at);
CREATE INDEX idx_user_analytics_events_session ON public.user_analytics_events(session_id);

CREATE INDEX idx_pharmacy_impressions_pharmacy_date ON public.pharmacy_impressions(pharmacy_id, created_at);
CREATE INDEX idx_pharmacy_impressions_type_date ON public.pharmacy_impressions(impression_type, created_at);
CREATE INDEX idx_pharmacy_impressions_session ON public.pharmacy_impressions(session_id);

-- Comments for documentation
COMMENT ON TABLE public.user_analytics_events IS 'Tracks user interactions and conversion funnel events';
COMMENT ON TABLE public.pharmacy_impressions IS 'Tracks pharmacy-specific impressions and interactions for performance metrics';