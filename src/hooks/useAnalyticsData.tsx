import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ServiceAnalytics {
  service_type: string;
  search_count: number;
  percentage: number;
}

export interface MedMeMetrics {
  total_impressions: number;
  medme_impressions: number;
  click_percentage: number;
  trend: number;
}

export interface FunnelStep {
  step: string;
  count: number;
  percentage: number;
}

export interface PharmacyMetrics {
  pharmacy_id: string;
  pharmacy_name: string;
  total_impressions: number;
  total_clicks: number;
  bookings: number;
  conversion_rate: number;
  is_medme: boolean;
}

const getDateFilter = (dateRange: string) => {
  const now = new Date();
  const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return startDate.toISOString();
};

export const useTopServices = (dateRange: string) => {
  return useQuery({
    queryKey: ['analytics', 'top-services', dateRange],
    queryFn: async (): Promise<ServiceAnalytics[]> => {
      const startDate = getDateFilter(dateRange);
      
      const { data, error } = await supabase
        .from('user_analytics_events')
        .select('service_type')
        .eq('event_type', 'search')
        .gte('created_at', startDate)
        .not('service_type', 'is', null);

      if (error) throw error;

      // Count service types
      const serviceCounts: Record<string, number> = {};
      data.forEach(event => {
        if (event.service_type) {
          serviceCounts[event.service_type] = (serviceCounts[event.service_type] || 0) + 1;
        }
      });

      const total = Object.values(serviceCounts).reduce((sum, count) => sum + count, 0);
      
      return Object.entries(serviceCounts)
        .map(([service_type, search_count]) => ({
          service_type,
          search_count,
          percentage: total > 0 ? Math.round((search_count / total) * 100) : 0
        }))
        .sort((a, b) => b.search_count - a.search_count)
        .slice(0, 10);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useMedMeMetrics = (dateRange: string) => {
  return useQuery({
    queryKey: ['analytics', 'medme-metrics', dateRange],
    queryFn: async (): Promise<MedMeMetrics> => {
      const startDate = getDateFilter(dateRange);
      
      const { data, error } = await supabase
        .from('pharmacy_impressions')
        .select('is_medme_pharmacy')
        .gte('created_at', startDate);

      if (error) throw error;

      const total = data.length;
      const medmeCount = data.filter(impression => impression.is_medme_pharmacy).length;
      const clickPercentage = total > 0 ? Math.round((medmeCount / total) * 100) : 0;

      // Calculate trend (simplified - comparing to previous period)
      const previousPeriodStart = getDateFilter(dateRange === '7d' ? '14d' : dateRange === '30d' ? '60d' : '180d');
      const { data: previousData } = await supabase
        .from('pharmacy_impressions')
        .select('is_medme_pharmacy')
        .gte('created_at', previousPeriodStart)
        .lt('created_at', startDate);

      const previousTotal = previousData?.length || 0;
      const previousMedme = previousData?.filter(imp => imp.is_medme_pharmacy).length || 0;
      const previousPercentage = previousTotal > 0 ? (previousMedme / previousTotal) * 100 : 0;
      const trend = clickPercentage - previousPercentage;

      return {
        total_impressions: total,
        medme_impressions: medmeCount,
        click_percentage: clickPercentage,
        trend: Math.round(trend * 10) / 10
      };
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useBookingFunnel = (dateRange: string) => {
  return useQuery({
    queryKey: ['analytics', 'booking-funnel', dateRange],
    queryFn: async (): Promise<FunnelStep[]> => {
      const startDate = getDateFilter(dateRange);
      
      const { data, error } = await supabase
        .from('user_analytics_events')
        .select('event_type, session_id')
        .gte('created_at', startDate)
        .in('event_type', ['search', 'results_shown', 'profile_view', 'book_start', 'book_confirmed']);

      if (error) throw error;

      // Group by session and track funnel progression
      const sessionEvents: Record<string, Set<string>> = {};
      data.forEach(event => {
        if (!sessionEvents[event.session_id]) {
          sessionEvents[event.session_id] = new Set();
        }
        sessionEvents[event.session_id].add(event.event_type);
      });

      const funnelSteps = [
        { step: 'Search', count: 0 },
        { step: 'Results Viewed', count: 0 },
        { step: 'Profile Viewed', count: 0 },
        { step: 'Booking Started', count: 0 },
        { step: 'Booking Confirmed', count: 0 }
      ];

      Object.values(sessionEvents).forEach(events => {
        if (events.has('search')) funnelSteps[0].count++;
        if (events.has('results_shown')) funnelSteps[1].count++;
        if (events.has('profile_view')) funnelSteps[2].count++;
        if (events.has('book_start')) funnelSteps[3].count++;
        if (events.has('book_confirmed')) funnelSteps[4].count++;
      });

      const totalSessions = funnelSteps[0].count;
      
      return funnelSteps.map(step => ({
        ...step,
        percentage: totalSessions > 0 ? Math.round((step.count / totalSessions) * 100) : 0
      }));
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const usePharmacyPerformance = (dateRange: string) => {
  return useQuery({
    queryKey: ['analytics', 'pharmacy-performance', dateRange],
    queryFn: async (): Promise<PharmacyMetrics[]> => {
      const startDate = getDateFilter(dateRange);
      
      // Get pharmacy impressions
      const { data: impressions, error: impressionsError } = await supabase
        .from('pharmacy_impressions')
        .select('pharmacy_id, impression_type, is_medme_pharmacy')
        .gte('created_at', startDate);

      if (impressionsError) throw impressionsError;

      // Get booking data
      const { data: bookings, error: bookingsError } = await supabase
        .from('user_analytics_events')
        .select('pharmacy_id, is_medme_pharmacy')
        .eq('event_type', 'book_confirmed')
        .gte('created_at', startDate)
        .not('pharmacy_id', 'is', null);

      if (bookingsError) throw bookingsError;

      // Get pharmacy names (simplified - using pharmacy_id as name for now)
      const pharmacyMetrics: Record<string, PharmacyMetrics> = {};

      impressions.forEach(impression => {
        if (!impression.pharmacy_id) return;
        
        if (!pharmacyMetrics[impression.pharmacy_id]) {
          pharmacyMetrics[impression.pharmacy_id] = {
            pharmacy_id: impression.pharmacy_id,
            pharmacy_name: `Pharmacy ${impression.pharmacy_id.slice(0, 8)}`,
            total_impressions: 0,
            total_clicks: 0,
            bookings: 0,
            conversion_rate: 0,
            is_medme: impression.is_medme_pharmacy || false
          };
        }

        pharmacyMetrics[impression.pharmacy_id].total_impressions++;
        
        if (['click_call', 'click_directions', 'click_website', 'click_book'].includes(impression.impression_type)) {
          pharmacyMetrics[impression.pharmacy_id].total_clicks++;
        }
      });

      bookings.forEach(booking => {
        if (booking.pharmacy_id && pharmacyMetrics[booking.pharmacy_id]) {
          pharmacyMetrics[booking.pharmacy_id].bookings++;
        }
      });

      // Calculate conversion rates
      Object.values(pharmacyMetrics).forEach(metrics => {
        metrics.conversion_rate = metrics.total_impressions > 0 
          ? Math.round((metrics.bookings / metrics.total_impressions) * 100 * 10) / 10 
          : 0;
      });

      return Object.values(pharmacyMetrics)
        .sort((a, b) => b.total_impressions - a.total_impressions)
        .slice(0, 20);
    },
    staleTime: 5 * 60 * 1000,
  });
};