import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  GooglePlacesData, 
  PharmacyDisplayData, 
  generateStableDisplayData, 
  searchPharmacyPlaces, 
  mergeGooglePlacesData 
} from '@/lib/pharmacyDataUtils';

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  website: string | null;
  latitude: number | null;
  longitude: number | null;
  type?: 'regular' | 'medme';
  googlePlacesData?: GooglePlacesData;
  displayData?: PharmacyDisplayData;
  distance?: number;
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
  radiusKm?: number;
}

export const usePharmacySearch = () => {
  const { toast } = useToast();
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastErrorRef = useRef<string | null>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Geocode input using Google Maps Geocoding when available; fallback to heuristics
  const geocodeLocation = async (location: string): Promise<{ lat: number; lng: number } | null> => {
    console.log(`🌍 Geocoding location: "${location}"`);

    // Check if it's coordinates already (from geolocation)
    const coordsMatch = location.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
    if (coordsMatch) {
      const coords = {
        lat: parseFloat(coordsMatch[1]),
        lng: parseFloat(coordsMatch[2])
      };
      console.log('📍 Location is already coordinates:', coords);
      return coords;
    }

    // Prefer Google Maps Geocoding if available
    try {
      if ((window as any).google?.maps) {
        const geocoder = new window.google.maps.Geocoder();
        const response = await new Promise<google.maps.GeocoderResponse>((resolve, reject) => {
          geocoder.geocode(
            {
              address: location,
              componentRestrictions: { country: 'CA' },
              region: 'CA',
            },
            (results, status) => {
              if (status === 'OK' && results && results.length > 0) {
                resolve({ results } as google.maps.GeocoderResponse);
              } else {
                reject(new Error(`Geocoding failed: ${status}`));
              }
            }
          );
        });

        const best = response.results[0];
        const loc = best.geometry.location;
        const coords = { lat: loc.lat(), lng: loc.lng() };
        console.log('✅ Google geocode result:', best.formatted_address, coords);
        return coords;
      }
    } catch (err) {
      console.warn('Google geocoding failed, falling back to heuristics:', err);
    }

    // Heuristic fallback: prefer major Canadian cities
    const locationLower = location.toLowerCase();
    const cityMap: Array<{ key: string | RegExp; lat: number; lng: number }> = [
      { key: 'vancouver', lat: 49.2827, lng: -123.1207 },
      { key: 'victoria', lat: 48.4284, lng: -123.3656 },
      { key: 'kelowna', lat: 49.8879, lng: -119.4960 },
      { key: 'surrey', lat: 49.1913, lng: -122.8490 },
      { key: 'burnaby', lat: 49.2488, lng: -122.9805 },
      { key: 'richmond', lat: 49.1666, lng: -123.1336 },
      { key: 'coquitlam', lat: 49.2838, lng: -122.7919 },
      { key: 'calgary', lat: 51.0447, lng: -114.0719 },
      { key: 'edmonton', lat: 53.5461, lng: -113.4938 },
      { key: 'winnipeg', lat: 49.8951, lng: -97.1384 },
      { key: 'toronto', lat: 43.6532, lng: -79.3832 },
      { key: 'ottawa', lat: 45.4215, lng: -75.6972 },
      { key: 'montreal', lat: 45.5017, lng: -73.5673 },
      { key: 'quebec', lat: 46.8139, lng: -71.2080 },
      { key: 'halifax', lat: 44.6488, lng: -63.5752 },
    ];
    for (const entry of cityMap) {
      if (typeof entry.key === 'string' ? locationLower.includes(entry.key) : entry.key.test(locationLower)) {
        return { lat: entry.lat, lng: entry.lng };
      }
    }

    // As a last resort, return Canada's centroid
    const fallback = { lat: 56.1304, lng: -106.3468 };
    console.warn(`Location "${location}" not recognized; using Canada fallback`, fallback);
    return fallback;
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

  // Enhance pharmacy with Google Places data and stable display data
  const enhancePharmacyWithData = async (pharmacy: Pharmacy, index: number): Promise<Pharmacy> => {
    // Generate stable display data
    const stableData = generateStableDisplayData(pharmacy.id, pharmacy.name, index);
    
    // Try to get Google Places data
    let googleData: GooglePlacesData | null = null;
    try {
      googleData = await searchPharmacyPlaces(pharmacy.name, pharmacy.address);
    } catch (error) {
      console.warn(`Failed to get Google Places data for ${pharmacy.name}:`, error);
    }

    // Merge the data
    const displayData = mergeGooglePlacesData(stableData, googleData);

    return {
      ...pharmacy,
      googlePlacesData: googleData || undefined,
      displayData
    };
  };

  // Enhance multiple pharmacies with basic display data (fast)
  const enhancePharmaciesWithBasicData = (pharmacies: Pharmacy[]): Pharmacy[] => {
    return pharmacies.map((pharmacy, index) => {
      const stableData = generateStableDisplayData(pharmacy.id, pharmacy.name, index);
      return {
        ...pharmacy,
        displayData: stableData
      };
    });
  };

  // Enhance multiple pharmacies with Google Places data (slow - only when needed)
  const enhancePharmaciesWithGoogleData = async (pharmacies: Pharmacy[]): Promise<Pharmacy[]> => {
    console.log(`🔍 Starting Google Places enhancement for ${pharmacies.length} pharmacies`);
    
    // Process in smaller batches to avoid rate limiting
    const batchSize = 3; // Reduced batch size for faster response
    const enhanced: Pharmacy[] = [];
    
    for (let i = 0; i < pharmacies.length; i += batchSize) {
      const batch = pharmacies.slice(i, i + batchSize);
      const enhancedBatch = await Promise.all(
        batch.map(async (pharmacy, batchIndex) => {
          try {
            const googleData = await searchPharmacyPlaces(pharmacy.name, pharmacy.address);
            if (googleData && pharmacy.displayData) {
              const enhancedDisplayData = mergeGooglePlacesData(pharmacy.displayData, googleData);
              return {
                ...pharmacy,
                googlePlacesData: googleData,
                displayData: enhancedDisplayData
              };
            }
          } catch (error) {
            console.warn(`Failed to get Google Places data for ${pharmacy.name}:`, error);
          }
          return pharmacy; // Return unchanged if Google data fails
        })
      );
      enhanced.push(...enhancedBatch);
      
      // Smaller delay between batches
      if (i + batchSize < pharmacies.length) {
        await new Promise(resolve => setTimeout(resolve, 100)); // Reduced from 200ms
      }
      
      console.log(`🔍 Enhanced ${enhanced.length}/${pharmacies.length} pharmacies with Google data`);
    }
    
    return enhanced;
  };

  // Search pharmacies with location-based filtering
  const searchPharmacies = async (filters: PharmacySearchFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Searching pharmacies with filters:', filters);

      // Get regular pharmacies
      const { data: regularPharmacies, error: regularError } = await supabase
        .from('pharmacies')
        .select('*')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .order('name');

      if (regularError) {
        console.error('❌ Error fetching regular pharmacies:', regularError);
        throw regularError;
      }
      
      console.log(`✅ Found ${regularPharmacies?.length || 0} regular pharmacies`);
      if (regularPharmacies?.length > 0) {
        console.log('First regular pharmacy:', regularPharmacies[0]);
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
          const radiusKm = filters.radiusKm || 50; // Default to 50km if no radius specified
          console.log(`🔍 Filtering pharmacies within ${radiusKm}km radius`);
          
          // Filter pharmacies within specified radius and sort by distance
          filteredPharmacies = filteredPharmacies
            .map(pharmacy => ({
              ...pharmacy,
              distance: calculateDistance(coords.lat, coords.lng, pharmacy.latitude!, pharmacy.longitude!)
            }))
            .filter(pharmacy => {
              const isWithinRadius = pharmacy.distance <= radiusKm;
              if (!isWithinRadius && pharmacy.distance <= radiusKm + 10) { // Log pharmacies just outside radius for debugging
                console.log(`🚫 Excluding ${pharmacy.name}: ${pharmacy.distance.toFixed(2)}km > ${radiusKm}km`);
              }
              return isWithinRadius;
            })
            .sort((a, b) => a.distance - b.distance);
        } else {
          // Fallback to text search if geocoding fails
          filteredPharmacies = filteredPharmacies.filter(pharmacy => 
            pharmacy.name.toLowerCase().includes(filters.location!.toLowerCase()) ||
            pharmacy.address.toLowerCase().includes(filters.location!.toLowerCase())
          );
        }
      } else {
        // No location specified - show all pharmacies sorted by name
        filteredPharmacies = filteredPharmacies.sort((a, b) => a.name.localeCompare(b.name));
      }

      console.log(`📍 Final result: ${filteredPharmacies.length} pharmacies to display`);
      
      // First, quickly load pharmacies with basic display data
      const basicEnhancedPharmacies = enhancePharmaciesWithBasicData(filteredPharmacies);
      setPharmacies(basicEnhancedPharmacies);
      
      // Then, optionally enhance with Google Places data if we have a reasonable number of pharmacies
      // This prevents slow loading when there are too many pharmacies
      if (filteredPharmacies.length <= 20) { // Only enhance if 20 or fewer pharmacies
        console.log(`🔍 Enhancing ${filteredPharmacies.length} pharmacies with Google Places data...`);
        try {
          const fullyEnhancedPharmacies = await enhancePharmaciesWithGoogleData(basicEnhancedPharmacies);
          setPharmacies(fullyEnhancedPharmacies);
          console.log(`✅ Google Places enhancement complete`);
        } catch (error) {
          console.warn('⚠️ Google Places enhancement failed, using basic data:', error);
        }
      } else {
        console.log(`⚡ Skipping Google Places enhancement for ${filteredPharmacies.length} pharmacies (too many for fast loading)`);
      }
    } catch (error) {
      console.error('❌ Error searching pharmacies:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to search pharmacies';
      setError(errorMessage);
      
      // Only show toast if this is a new error (prevent spam)
      if (lastErrorRef.current !== errorMessage) {
        lastErrorRef.current = errorMessage;
        toast({
          variant: "destructive",
          title: "Search failed",
          description: errorMessage,
        });
      }
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

      // First, quickly load pharmacies with basic display data
      const basicEnhancedPharmacies = enhancePharmaciesWithBasicData(data || []);
      setPharmacies(basicEnhancedPharmacies);
      
      // Skip Google Places enhancement for getAllPharmacies to avoid long load times
      console.log(`⚡ Loaded ${basicEnhancedPharmacies.length} pharmacies with basic data (no Google enhancement for full list)`);;
    } catch (error) {
      console.error('Error fetching pharmacies:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch pharmacies';
      setError(errorMessage);
      
      // Only show toast if this is a new error (prevent spam)
      if (lastErrorRef.current !== errorMessage) {
        lastErrorRef.current = errorMessage;
        toast({
          variant: "destructive", 
          title: "Failed to load pharmacies",
          description: errorMessage,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Get pharmacies near a specific location with enhanced filtering
  const getNearbyPharmacies = async (latitude: number, longitude: number, radiusKm: number = 25) => {
    try {
      setLoading(true);
      setError(null);

      console.log(`🔍 Searching for pharmacies within ${radiusKm}km of lat: ${latitude}, lng: ${longitude}`);

      // Get regular pharmacies
      const { data: regularPharmacies, error: regularError } = await supabase
        .from('pharmacies')
        .select('*')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (regularError) {
        console.error('❌ Error fetching regular pharmacies:', regularError);
        throw regularError;
      }

      console.log(`✅ Found ${regularPharmacies?.length || 0} regular pharmacies`);

      // Get MedMe pharmacies
      const { data: medmePharmacies, error: medmeError } = await supabase
        .from('medme_pharmacies' as any)
        .select('id, name, "Pharmacy Address__street_address", "Pharmacy Address__latitude", "Pharmacy Address__longitude"')
        .order('name');

      if (medmeError) {
        console.warn('⚠️ Error fetching MedMe pharmacies:', medmeError);
      }

      console.log(`✅ Found ${medmePharmacies?.length || 0} MedMe pharmacies`);

      // Filter MedMe pharmacies to only include those with valid coordinates
      const validMedmePharmacies = (medmePharmacies || []).filter((mp: any) => {
        const lat = mp["Pharmacy Address__latitude"];
        const lng = mp["Pharmacy Address__longitude"];
        return lat && lng && lat !== "0" && lng !== "0" && lat !== 0 && lng !== 0;
      });

      console.log(`✅ ${validMedmePharmacies.length} MedMe pharmacies with valid coordinates`);

      // Combine and convert all pharmacies
      let allPharmacies: Pharmacy[] = [
        ...(regularPharmacies || []).map(p => ({ ...p, type: 'regular' as const })),
        ...validMedmePharmacies.map((mp: any) => convertMedMePharmacy(mp as MedMePharmacy))
      ];

      console.log(`📊 Total pharmacies before radius filtering: ${allPharmacies.length}`);

      // Filter by distance and sort by proximity
      const nearbyPharmacies = allPharmacies
        .map(pharmacy => {
          const distance = calculateDistance(latitude, longitude, pharmacy.latitude!, pharmacy.longitude!);
          return {
            ...pharmacy,
            distance
          };
        })
        .filter(pharmacy => {
          const isWithinRadius = pharmacy.distance <= radiusKm;
          if (!isWithinRadius) {
            console.log(`🚫 Excluding ${pharmacy.name}: ${pharmacy.distance.toFixed(2)}km > ${radiusKm}km`);
          }
          return isWithinRadius;
        })
        .sort((a, b) => a.distance - b.distance);

      console.log(`📍 Found ${nearbyPharmacies.length} pharmacies within ${radiusKm}km radius`);
      
      // Log the closest few pharmacies for debugging
      nearbyPharmacies.slice(0, 5).forEach((pharmacy, index) => {
        console.log(`${index + 1}. ${pharmacy.name} - ${pharmacy.distance.toFixed(2)}km (${pharmacy.type})`);
      });

      // First, quickly load pharmacies with basic display data
      const basicEnhancedPharmacies = enhancePharmaciesWithBasicData(nearbyPharmacies);
      setPharmacies(basicEnhancedPharmacies);
      
      // Then, enhance with Google Places data if we have a reasonable number of pharmacies
      if (nearbyPharmacies.length <= 15) { // Slightly lower threshold for nearby searches
        console.log(`🔍 Enhancing ${nearbyPharmacies.length} nearby pharmacies with Google Places data...`);
        try {
          const fullyEnhancedPharmacies = await enhancePharmaciesWithGoogleData(basicEnhancedPharmacies);
          setPharmacies(fullyEnhancedPharmacies);
          console.log(`✅ Google Places enhancement complete for nearby pharmacies`);
        } catch (error) {
          console.warn('⚠️ Google Places enhancement failed for nearby pharmacies, using basic data:', error);
        }
      } else {
        console.log(`⚡ Skipping Google Places enhancement for ${nearbyPharmacies.length} nearby pharmacies (too many for fast loading)`);
      }
    } catch (error) {
      console.error('❌ Error fetching nearby pharmacies:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch nearby pharmacies';
      setError(errorMessage);
      
      // Only show toast if this is a new error (prevent spam)
      if (lastErrorRef.current !== errorMessage) {
        lastErrorRef.current = errorMessage;
        toast({
          variant: "destructive",
          title: "Failed to load nearby pharmacies", 
          description: errorMessage,
        });
      }
    } finally {
      setLoading(false);
    }
  };


  return {
    pharmacies,
    loading,
    error,
    searchPharmacies,
    getAllPharmacies,
    getNearbyPharmacies,
    calculateDistance,
    enhancePharmacyWithData,
  };
};