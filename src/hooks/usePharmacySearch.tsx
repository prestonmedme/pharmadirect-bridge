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
  type?: 'regular' | 'medme';
}

export interface MedMePharmacy {
  id: string;
  name: string | null;
  "Pharmacy Address__street_address": string | null;
  "Pharmacy Address__latitude": string | null;
  "Pharmacy Address__longitude": string | null;
}

export interface PharmacySearchFilters {
  location?: string;
  service?: string;
  date?: Date;
  medmeOnly?: boolean;
}

export const usePharmacySearch = () => {
  const { toast } = useToast();
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Convert MedMe pharmacy to standard pharmacy format
  const convertMedMePharmacy = (medmePharmacy: MedMePharmacy): Pharmacy => {
    return {
      id: medmePharmacy.id,
      name: medmePharmacy.name || 'MedMe Pharmacy',
      address: medmePharmacy["Pharmacy Address__street_address"] || '',
      phone: null,
      website: null,
      latitude: medmePharmacy["Pharmacy Address__latitude"] ? parseFloat(medmePharmacy["Pharmacy Address__latitude"]) : null,
      longitude: medmePharmacy["Pharmacy Address__longitude"] ? parseFloat(medmePharmacy["Pharmacy Address__longitude"]) : null,
      type: 'medme'
    };
  };

  // Simple geocoding for common zip codes (in a real app, you'd use a geocoding API)
  const geocodeLocation = async (location: string): Promise<{ lat: number; lng: number } | null> => {
    // Check if it's coordinates already (from geolocation)
    const coordsMatch = location.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
    if (coordsMatch) {
      return {
        lat: parseFloat(coordsMatch[1]),
        lng: parseFloat(coordsMatch[2])
      };
    }

    // Simple zip code mapping for San Francisco area (demo purposes)
    const zipCodeMap: Record<string, { lat: number; lng: number }> = {
      '94102': { lat: 37.7869, lng: -122.4075 },
      '94103': { lat: 37.7749, lng: -122.4194 },
      '94104': { lat: 37.7912, lng: -122.4013 },
      '94105': { lat: 37.7881, lng: -122.3916 },
      '94107': { lat: 37.7594, lng: -122.3928 },
      '94108': { lat: 37.7922, lng: -122.4079 },
      '94109': { lat: 37.7925, lng: -122.4169 },
      '94110': { lat: 37.7486, lng: -122.4133 },
      '94111': { lat: 37.7970, lng: -122.3991 },
      '94112': { lat: 37.7230, lng: -122.4413 },
      '94114': { lat: 37.7609, lng: -122.4350 },
      '94115': { lat: 37.7881, lng: -122.4378 },
      '94116': { lat: 37.7448, lng: -122.4861 },
      '94117': { lat: 37.7693, lng: -122.4481 },
      '94118': { lat: 37.7816, lng: -122.4628 },
      '94121': { lat: 37.7809, lng: -122.4893 },
      '94122': { lat: 37.7597, lng: -122.4831 },
      '94123': { lat: 37.7984, lng: -122.4397 },
      '94124': { lat: 37.7312, lng: -122.3826 },
      '94127': { lat: 37.7405, lng: -122.4581 },
      '94131': { lat: 37.7447, lng: -122.4411 },
      '94132': { lat: 37.7230, lng: -122.4813 },
      '94133': { lat: 37.8030, lng: -122.4107 },
      '94134': { lat: 37.7187, lng: -122.4057 }
    };

    // Check for zip code
    const zipMatch = location.match(/\b(\d{5})\b/);
    if (zipMatch && zipCodeMap[zipMatch[1]]) {
      return zipCodeMap[zipMatch[1]];
    }

    // For text addresses, use a basic San Francisco center as fallback
    if (location.toLowerCase().includes('san francisco') || location.toLowerCase().includes('sf')) {
      return { lat: 37.7749, lng: -122.4194 }; // SF center
    }

    return null;
  };

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

  // Search pharmacies with location-based filtering
  const searchPharmacies = async (filters: PharmacySearchFilters = {}) => {
    try {
      setLoading(true);
      setError(null);

      // Get regular pharmacies
      const { data: regularPharmacies, error: regularError } = await supabase
        .from('pharmacies')
        .select('*')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .order('name');

      if (regularError) {
        throw regularError;
      }

      // Get MedMe pharmacies using direct query - be more lenient with filtering
      const { data: medmePharmacies, error: medmeError } = await supabase
        .from('medme_pharmacies' as any)
        .select('id, name, "Pharmacy Address__street_address", "Pharmacy Address__latitude", "Pharmacy Address__longitude"')
        .order('name');

      if (medmeError) {
        console.warn('Error fetching MedMe pharmacies:', medmeError);
      }

      console.log('Fetched MedMe pharmacies:', medmePharmacies?.length);
      console.log('First few MedMe pharmacies:', medmePharmacies?.slice(0, 3));

      // Filter MedMe pharmacies to only include those with valid coordinates
      const validMedmePharmacies = (medmePharmacies || []).filter((mp: any) => {
        const lat = mp["Pharmacy Address__latitude"];
        const lng = mp["Pharmacy Address__longitude"];
        return lat && lng && lat !== "0" && lng !== "0" && lat !== 0 && lng !== 0;
      });

      console.log('Valid MedMe pharmacies with coordinates:', validMedmePharmacies.length);

      // Combine and convert pharmacies
      let allPharmacies: Pharmacy[] = [
        ...(regularPharmacies || []).map(p => ({ ...p, type: 'regular' as const })),
        ...validMedmePharmacies.map((mp: any) => convertMedMePharmacy(mp as MedMePharmacy))
      ];

      // Filter by MedMe only if requested
      if (filters.medmeOnly) {
        allPharmacies = allPharmacies.filter(p => p.type === 'medme');
      }

      let filteredPharmacies = allPharmacies;

      // If location is provided, filter by proximity
      if (filters.location && filters.location.trim()) {
        const coords = await geocodeLocation(filters.location.trim());
        
        if (coords) {
          // Filter pharmacies within 50km radius and sort by distance
          filteredPharmacies = filteredPharmacies
            .map(pharmacy => ({
              ...pharmacy,
              distance: calculateDistance(coords.lat, coords.lng, pharmacy.latitude!, pharmacy.longitude!)
            }))
            .filter(pharmacy => pharmacy.distance <= 50) // 50km radius
            .sort((a, b) => a.distance - b.distance);
        } else {
          // Fallback to text search if geocoding fails
          filteredPharmacies = filteredPharmacies.filter(pharmacy => 
            pharmacy.name.toLowerCase().includes(filters.location!.toLowerCase()) ||
            pharmacy.address.toLowerCase().includes(filters.location!.toLowerCase())
          );
        }
      }

      setPharmacies(filteredPharmacies);
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

  // Get pharmacies near a specific location with enhanced filtering
  const getNearbyPharmacies = async (latitude: number, longitude: number, radiusKm: number = 25) => {
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

      // Filter by distance and sort by proximity
      const nearbyPharmacies = (data || [])
        .map(pharmacy => ({
          ...pharmacy,
          distance: calculateDistance(latitude, longitude, pharmacy.latitude!, pharmacy.longitude!)
        }))
        .filter(pharmacy => pharmacy.distance <= radiusKm)
        .sort((a, b) => a.distance - b.distance);

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