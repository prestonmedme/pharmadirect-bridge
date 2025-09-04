import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useMapboxToken = () => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        console.log('Fetching Mapbox token...');
        
        const { data, error } = await supabase.functions.invoke('mapbox-token');
        
        if (error) {
          console.error('Error fetching Mapbox token:', error);
          setError('Failed to fetch map token');
          return;
        }

        if (data?.token) {
          console.log('Mapbox token retrieved successfully');
          setToken(data.token);
        } else {
          console.error('No token received from function');
          setError('No map token received');
        }
      } catch (error) {
        console.error('Error in useMapboxToken:', error);
        setError('Failed to load map token');
      } finally {
        setLoading(false);
      }
    };

    fetchToken();
  }, []);

  return { token, loading, error };
};