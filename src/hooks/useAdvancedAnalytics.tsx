import { useQuery } from '@tanstack/react-query';
import { supabaseTemp as supabase } from '@/lib/supabaseClient';

// Geographic Analytics
export interface GeographicData {
  location: string;
  search_count: number;
  conversion_rate: number;
  medme_percentage: number;
}

export const useGeographicAnalytics = (dateRange: string) => {
  return useQuery({
    queryKey: ['analytics', 'geographic', dateRange],
    queryFn: async (): Promise<GeographicData[]> => {
      const startDate = getDateFilter(dateRange);
      
      const { data, error } = await supabase
        .from('user_analytics_events')
        .select('event_data, event_type')
        .gte('created_at', startDate)
        .eq('event_type', 'search')
        .not('event_data->location', 'is', null);

      if (error) throw error;

      const locationStats: Record<string, { searches: number; conversions: number }> = {};
      
      data.forEach(event => {
        const eventData = event.event_data as any;
        const location = eventData?.location;
        if (location && typeof location === 'string') {
          if (!locationStats[location]) {
            locationStats[location] = { searches: 0, conversions: 0 };
          }
          locationStats[location].searches++;
        }
      });

      return Object.entries(locationStats)
        .map(([location, stats]) => ({
          location,
          search_count: stats.searches,
          conversion_rate: stats.searches > 0 ? (stats.conversions / stats.searches) * 100 : 0,
          medme_percentage: 0 // Would need to join with impression data
        }))
        .sort((a, b) => b.search_count - a.search_count)
        .slice(0, 20);
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Time-based Analytics
export interface TimeAnalytics {
  hourly_data: Array<{ hour: number; activity: number }>;
  daily_data: Array<{ date: string; activity: number }>;
  growth_rate: number;
}

export const useTimeBasedAnalytics = (dateRange: string) => {
  return useQuery({
    queryKey: ['analytics', 'time-based', dateRange],
    queryFn: async (): Promise<TimeAnalytics> => {
      const startDate = getDateFilter(dateRange);
      
      const { data, error } = await supabase
        .from('user_analytics_events')
        .select('created_at, event_type')
        .gte('created_at', startDate)
        .in('event_type', ['search', 'profile_view', 'book_start']);

      if (error) throw error;

      // Group by hour
      const hourlyStats: Record<number, number> = {};
      const dailyStats: Record<string, number> = {};
      
      data.forEach(event => {
        const date = new Date(event.created_at);
        const hour = date.getHours();
        const dayKey = date.toISOString().split('T')[0];
        
        hourlyStats[hour] = (hourlyStats[hour] || 0) + 1;
        dailyStats[dayKey] = (dailyStats[dayKey] || 0) + 1;
      });

      const hourly_data = Array.from({ length: 24 }, (_, hour) => ({
        hour,
        activity: hourlyStats[hour] || 0
      }));

      const daily_data = Object.entries(dailyStats)
        .map(([date, activity]) => ({ date, activity }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Calculate growth rate (simplified)
      const recentActivity = daily_data.slice(-3).reduce((sum, d) => sum + d.activity, 0);
      const earlierActivity = daily_data.slice(0, 3).reduce((sum, d) => sum + d.activity, 0);
      const growth_rate = earlierActivity > 0 ? ((recentActivity - earlierActivity) / earlierActivity) * 100 : 0;

      return {
        hourly_data,
        daily_data,
        growth_rate
      };
    },
    staleTime: 5 * 60 * 1000,
  });
};

// User Behavior Analytics
export interface UserBehaviorData {
  total_sessions: number;
  new_users: number;
  returning_users: number;
  avg_session_duration: number;
  avg_pages_per_session: number;
  drop_off_points: Array<{ step: string; users: number; percentage: number }>;
  common_paths: Array<{ journey: string; count: number }>;
}

export const useUserBehaviorAnalytics = (dateRange: string) => {
  return useQuery({
    queryKey: ['analytics', 'user-behavior', dateRange],
    queryFn: async (): Promise<UserBehaviorData> => {
      const startDate = getDateFilter(dateRange);
      
      const { data, error } = await supabase
        .from('user_analytics_events')
        .select('session_id, user_id, event_type, created_at')
        .gte('created_at', startDate);

      if (error) throw error;

      // Group by session
      const sessions: Record<string, { events: string[]; user_id: string | null; duration: number }> = {};
      
      data.forEach(event => {
        if (!sessions[event.session_id]) {
          sessions[event.session_id] = { 
            events: [], 
            user_id: event.user_id, 
            duration: 0 
          };
        }
        sessions[event.session_id].events.push(event.event_type);
      });

      const total_sessions = Object.keys(sessions).length;
      const new_users = Object.values(sessions).filter(s => !s.user_id).length;
      const returning_users = total_sessions - new_users;

      // Calculate drop-off points
      const funnelSteps = ['search', 'results_shown', 'profile_view', 'book_start', 'book_confirmed'];
      const stepCounts = funnelSteps.map(step => ({
        step,
        users: Object.values(sessions).filter(s => s.events.includes(step)).length
      }));

      const drop_off_points = stepCounts.slice(0, -1).map((step, index) => {
        const currentUsers = step.users;
        const nextUsers = stepCounts[index + 1]?.users || 0;
        const dropOff = currentUsers - nextUsers;
        
        return {
          step: step.step,
          users: dropOff,
          percentage: currentUsers > 0 ? (dropOff / currentUsers) * 100 : 0
        };
      });

      // Common user paths (simplified)
      const pathCounts: Record<string, number> = {};
      Object.values(sessions).forEach(session => {
        const path = session.events.slice(0, 3).join(' → ');
        pathCounts[path] = (pathCounts[path] || 0) + 1;
      });

      const common_paths = Object.entries(pathCounts)
        .map(([journey, count]) => ({ journey, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        total_sessions,
        new_users,
        returning_users,
        avg_session_duration: 180, // Placeholder
        avg_pages_per_session: 3.2, // Placeholder
        drop_off_points,
        common_paths
      };
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Service Deep Dive
export interface ServiceDeepDiveData {
  services: Array<{
    service_type: string;
    searches: number;
    conversions: number;
    abandonment_rate: number;
  }>;
  trending: Array<{
    service_type: string;
    growth: number;
    current_searches: number;
  }>;
}

export const useServiceDeepDive = (dateRange: string) => {
  return useQuery({
    queryKey: ['analytics', 'service-deep-dive', dateRange],
    queryFn: async (): Promise<ServiceDeepDiveData> => {
      const startDate = getDateFilter(dateRange);
      
      // Get search data
      const { data: searchData, error: searchError } = await supabase
        .from('user_analytics_events')
        .select('service_type, session_id, event_type')
        .gte('created_at', startDate)
        .not('service_type', 'is', null);

      if (searchError) throw searchError;

      // Group by service type
      const serviceStats: Record<string, { searches: number; conversions: number; sessions: Set<string> }> = {};
      
      searchData.forEach(event => {
        if (!serviceStats[event.service_type]) {
          serviceStats[event.service_type] = { 
            searches: 0, 
            conversions: 0, 
            sessions: new Set() 
          };
        }
        
        serviceStats[event.service_type].sessions.add(event.session_id);
        
        if (event.event_type === 'search') {
          serviceStats[event.service_type].searches++;
        } else if (event.event_type === 'book_confirmed') {
          serviceStats[event.service_type].conversions++;
        }
      });

      const services = Object.entries(serviceStats).map(([service_type, stats]) => ({
        service_type,
        searches: stats.searches,
        conversions: stats.conversions,
        abandonment_rate: stats.searches > 0 ? ((stats.searches - stats.conversions) / stats.searches) * 100 : 0
      }));

      // Calculate trending (simplified)
      const trending = services.map(service => ({
        service_type: service.service_type,
        growth: Math.random() * 50 - 25, // Placeholder - would need historical comparison
        current_searches: service.searches
      })).sort((a, b) => b.growth - a.growth);

      return {
        services: services.sort((a, b) => b.searches - a.searches),
        trending
      };
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Helper function
const getDateFilter = (dateRange: string) => {
  const now = new Date();
  const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return startDate.toISOString();
};