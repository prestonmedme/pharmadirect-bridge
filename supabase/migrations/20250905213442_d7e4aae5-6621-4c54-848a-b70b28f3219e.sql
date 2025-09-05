-- Fix RLS policy for user_analytics_events to allow anonymous users to insert analytics events
DROP POLICY IF EXISTS "Analytics events are publicly readable" ON public.user_analytics_events;

-- Create new policies for user_analytics_events
CREATE POLICY "Analytics events are publicly readable" 
ON public.user_analytics_events 
FOR SELECT 
USING (true);

CREATE POLICY "Analytics events can be inserted by anyone" 
ON public.user_analytics_events 
FOR INSERT 
WITH CHECK (true);

-- Enable RLS on the table (if not already enabled)
ALTER TABLE public.user_analytics_events ENABLE ROW LEVEL SECURITY;