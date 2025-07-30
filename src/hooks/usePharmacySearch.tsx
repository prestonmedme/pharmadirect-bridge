import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  website: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface PharmacySearchFilters {
  location?: string;
  service?: string;
  date?: Date;
}

export const usePharmacySearch = () => {
  const { toast } = useToast();
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Search pharmacies with optional filters
  const searchPharmacies = async (filters: PharmacySearchFilters = {}) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('pharmacies')
        .select('*');

      // If location is provided, we could add location-based filtering here
      // For now, we'll just search by name/address if location is provided
      if (filters.location) {
        query = query.or(`name.ilike.%${filters.location}%,address.ilike.%${filters.location}%`);
      }

      const { data, error } = await query.order('name');

      if (error) {
        throw error;
      }

      setPharmacies(data || []);
    } catch (error) {
      console.error('Error searching pharmacies:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to search pharmacies';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Search failed",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  // Get all pharmacies
  const getAllPharmacies = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('pharmacies')
        .select('*')
        .order('name');

      if (error) {
        throw error;
      }

      setPharmacies(data || []);
    } catch (error) {
      console.error('Error fetching pharmacies:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch pharmacies';
      setError(errorMessage);
      toast({
        variant: "destructive", 
        title: "Failed to load pharmacies",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  // Get pharmacies near a specific location
  const getNearbyPharmacies = async (latitude: number, longitude: number, radiusKm: number = 10) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('pharmacies')
        .select('*')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (error) {
        throw error;
      }

      // Filter by distance client-side
      const nearbyPharmacies = (data || []).filter(pharmacy => {
        if (!pharmacy.latitude || !pharmacy.longitude) return false;
        const distance = calculateDistance(latitude, longitude, pharmacy.latitude, pharmacy.longitude);
        return distance <= radiusKm;
      }).sort((a, b) => {
        const distanceA = calculateDistance(latitude, longitude, a.latitude!, a.longitude!);
        const distanceB = calculateDistance(latitude, longitude, b.latitude!, b.longitude!);
        return distanceA - distanceB;
      });

      setPharmacies(nearbyPharmacies);
    } catch (error) {
      console.error('Error fetching nearby pharmacies:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch nearby pharmacies';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Failed to load nearby pharmacies", 
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  // Load all pharmacies on initial mount
  useEffect(() => {
    getAllPharmacies();
  }, []);

  return {
    pharmacies,
    loading,
    error,
    searchPharmacies,
    getAllPharmacies,
    getNearbyPharmacies,
    calculateDistance,
  };
};