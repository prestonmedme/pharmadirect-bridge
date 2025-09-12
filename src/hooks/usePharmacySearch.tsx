import { useState, useEffect, useRef } from 'react';
import { supabaseTemp as supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { AnalyticsService } from '@/lib/analytics';
import { 
  PharmacyDisplayData, 
  generateStableDisplayData
} from '@/lib/pharmacyDataUtils';

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  phone: string | null;
  website: string | null;
  latitude: number | null;
  longitude: number | null;
  services: string[] | null;
  type?: 'regular' | 'medme' | 'us';
  displayData?: PharmacyDisplayData;
  distance?: number;
  logoUrl?: string; // Add logo URL support
}

export interface MedMePharmacy {
  id: string;
  pharmacy_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface USPharmacy {
  id: string;
  name: string | null;
  address: string | null;
  phone: string | null;
  zip_code: number | null;
  state_name: string | null;
  website: string | null;
  opening_hours: string | null;
  ratings: number | null;
  lat: number | null;
  lng: number | null;
}

export interface PharmacySearchFilters {
  location?: string;
  service?: string | string[]; // Support both single and multiple services
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

  // Convert MedMe pharmacy to standard format (updated for correct table structure)
  const convertMedMePharmacy = (medmePharmacy: MedMePharmacy): Pharmacy => {
    // MedMe pharmacies now only have id, pharmacy_id, is_active
    // We'll need to get actual pharmacy data from another source or mark as incomplete
    return {
      id: medmePharmacy.id,
      name: `MedMe Partner Pharmacy ${medmePharmacy.pharmacy_id?.substring(0, 8) || 'Unknown'}`,
      address: 'Address pending verification',
      city: 'Unknown',
      state: 'Unknown',
      zip_code: 'Unknown',
      phone: null,
      website: null,
      latitude: null, // No coordinate data in current table structure
      longitude: null,
      services: ['MedMe Connected'],
      type: 'medme'
    };
  };

  // Convert US pharmacy to standard pharmacy format
  const convertUSPharmacy = (usPharmacy: USPharmacy): Pharmacy => {
    // Extract city from address or use state as fallback
    const addressParts = (usPharmacy.address || '').split(',').map(p => p.trim());
    const city = addressParts.length > 1 ? addressParts[addressParts.length - 2] : (usPharmacy.state_name || 'Unknown');
    
    return {
      id: usPharmacy.id,
      name: usPharmacy.name || 'US Pharmacy',
      address: usPharmacy.address || '',
      city: city,
      state: usPharmacy.state_name || 'Unknown',
      zip_code: usPharmacy.zip_code?.toString() || '',
      phone: usPharmacy.phone || null,
      website: usPharmacy.website || null,
      latitude: usPharmacy.lat || null,
      longitude: usPharmacy.lng || null,
      services: null,
      type: 'us',
      logoUrl: (usPharmacy as any).logoUrl // Preserve logo URL if present
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
      
      // Validate coordinates are within US bounds
      if (coords.lat < 24.5 || coords.lat > 49.4 || coords.lng < -125.0 || coords.lng > -66.9) {
        console.warn('⚠️ Coordinates appear to be outside US bounds:', coords);
      }
      
      return coords;
    }

    // Prefer Google Maps Geocoding if available
    try {
      if ((window as any).google?.maps) {
        console.log('🗺️ Using Google Maps geocoding...');
        const geocoder = new window.google.maps.Geocoder();
        const response = await new Promise<google.maps.GeocoderResponse>((resolve, reject) => {
          geocoder.geocode(
            {
              address: location,
              componentRestrictions: { country: 'US' },
              region: 'US',
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
        
        // Validate coordinates
        if (coords.lat < 24.5 || coords.lat > 49.4 || coords.lng < -125.0 || coords.lng > -66.9) {
          console.warn('⚠️ Google geocode result appears outside US bounds:', coords, best.formatted_address);
        }
        
        console.log('✅ Google geocode result:', best.formatted_address, coords);
        return coords;
      }
    } catch (err) {
      console.warn('❌ Google geocoding failed, falling back to heuristics:', err);
    }

    // Heuristic fallback: prefer major California cities
    const locationLower = location.toLowerCase();
    const cityMap: Array<{ key: string | RegExp; lat: number; lng: number }> = [
      { key: 'los angeles', lat: 34.0522, lng: -118.2437 },
      { key: 'san francisco', lat: 37.7749, lng: -122.4194 },
      { key: 'san diego', lat: 32.7157, lng: -117.1611 },
      { key: 'sacramento', lat: 38.5816, lng: -121.4944 },
      { key: 'fresno', lat: 36.7378, lng: -119.7871 },
      { key: 'oakland', lat: 37.8044, lng: -122.2712 },
      { key: 'san jose', lat: 37.3382, lng: -121.8863 },
      { key: 'long beach', lat: 33.7701, lng: -118.1937 },
      { key: 'bakersfield', lat: 35.3733, lng: -119.0187 },
      { key: 'anaheim', lat: 33.8366, lng: -117.9143 },
      { key: 'santa ana', lat: 33.7455, lng: -117.8677 },
      { key: 'riverside', lat: 33.9533, lng: -117.3962 },
      { key: 'stockton', lat: 37.9577, lng: -121.2908 },
      { key: 'irvine', lat: 33.6846, lng: -117.8265 },
      { key: 'chula vista', lat: 32.6401, lng: -117.0842 },
    ];
    for (const entry of cityMap) {
      if (typeof entry.key === 'string' ? locationLower.includes(entry.key) : entry.key.test(locationLower)) {
        return { lat: entry.lat, lng: entry.lng };
      }
    }

    // As a last resort, return California's centroid
    const fallback = { lat: 36.7783, lng: -119.4179 };
    console.warn(`Location "${location}" not recognized; using California fallback`, fallback);
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

  // Database verification function for debugging distance calculations
  const verifyDatabaseDistances = async (centerLat: number, centerLng: number, radiusKm: number, locationName: string) => {
    console.log(`🔍 DATABASE VERIFICATION: Checking pharmacies within ${radiusKm}km of ${locationName} (${centerLat}, ${centerLng})`);
    
    try {
      // Query US pharmacy data directly
      const { data: usPharmacies, error: usError } = await supabase
        .from('us_pharmacy_data')
        .select('name, address, lat, lng')
        .not('lat', 'is', null)
        .not('lng', 'is', null);

      if (usError) {
        console.error('❌ Database verification failed:', usError);
        return;
      }

      const pharmaciesWithDistance = (usPharmacies || [])
        .map(p => ({
          name: p.name,
          address: p.address,
          lat: p.lat,
          lng: p.lng,
          distance: calculateDistance(centerLat, centerLng, p.lat, p.lng)
        }))
        .sort((a, b) => a.distance - b.distance);

      const withinRadius = pharmaciesWithDistance.filter(p => p.distance <= radiusKm);
      const closest10 = pharmaciesWithDistance.slice(0, 10);
      
      console.log(`📊 DATABASE VERIFICATION RESULTS:`);
      console.log(`   Total US pharmacies with coordinates: ${pharmaciesWithDistance.length}`);
      console.log(`   Within ${radiusKm}km: ${withinRadius.length}`);
      console.log(`   Closest 10 pharmacies:`, closest10.map(p => ({
        name: p.name?.substring(0, 30) + '...',
        distance: `${p.distance.toFixed(2)}km`,
        coords: `${p.lat}, ${p.lng}`
      })));
      
      if (withinRadius.length > 0) {
        console.log(`   Sample pharmacies within radius:`, withinRadius.slice(0, 3).map(p => ({
          name: p.name?.substring(0, 30) + '...',
          address: p.address?.substring(0, 40) + '...',
          distance: `${p.distance.toFixed(2)}km`
        })));
      }
      
    } catch (error) {
      console.error('❌ Database verification error:', error);
    }
  };

  // Enhance pharmacy with stable display data only (Mapbox-based implementation)
  const enhancePharmacyWithData = async (pharmacy: Pharmacy, index: number): Promise<Pharmacy> => {
    // Generate stable display data
    const stableData = generateStableDisplayData(pharmacy.id, pharmacy.name, index);

    return {
      ...pharmacy,
      displayData: stableData
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

  // Note: Google Places enhancement removed for Mapbox-based implementation

  // Search pharmacies with location-based filtering
  const searchPharmacies = async (filters: PharmacySearchFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Searching pharmacies with filters:', filters);

      // Get regular pharmacies - handle gracefully if table is empty
      const { data: regularPharmacies, error: regularError } = await supabase
        .from('pharmacies')
        .select('*')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .order('name');

      if (regularError) {
        console.warn('⚠️ Could not fetch regular pharmacies (table may be empty):', regularError);
        // Don't throw error, just log warning and continue with empty array
      }
      
      console.log(`✅ Found ${regularPharmacies?.length || 0} regular pharmacies`);
      if (regularPharmacies?.length > 0) {
        console.log('First regular pharmacy:', regularPharmacies[0]);
      }

      // Get MedMe pharmacies - fix column reference issue
      const { data: medmePharmacies, error: medmeError } = await supabase
        .from('medme_pharmacies')
        .select('id, pharmacy_id, is_active')
        .eq('is_active', true)
        .order('id');

      if (medmeError) {
        console.warn('Error fetching MedMe pharmacies:', medmeError);
      } else {
        console.log(`✅ Fetched ${medmePharmacies?.length || 0} active MedMe pharmacies`);
      }

      // Build a set of MedMe-linked pharmacy IDs
      const medmePharmacyIds = new Set((medmePharmacies || []).map((m: any) => m.pharmacy_id));

      // Get US pharmacies with database-level distance filtering for efficiency
      let usPharmaciesQuery = supabase
        .from('us_pharmacy_data')
        .select('id, name, address, phone, zip_code, state_name, website, opening_hours, ratings, lat, lng, main_image_url')
        .not('lat', 'is', null)
        .not('lng', 'is', null);

      // If location filtering is requested, add database-level distance filtering
      if (filters.location?.trim()) {
        const coords = await geocodeLocation(filters.location.trim());
        if (coords) {
          const radiusKm = filters.radiusKm || 50;
          console.log(`🎯 Using database-level distance filtering: center(${coords.lat}, ${coords.lng}) radius=${radiusKm}km`);
          
          // Use database-level distance calculation (more efficient than JavaScript)
          // This calculates approximate distance using lat/lng differences
          const latDiff = radiusKm / 111.0; // 1 degree latitude ≈ 111km
          const lngDiff = radiusKm / (111.0 * Math.cos(coords.lat * Math.PI / 180)); // longitude varies by latitude
          
          usPharmaciesQuery = usPharmaciesQuery
            .gte('lat', coords.lat - latDiff)
            .lte('lat', coords.lat + latDiff)
            .gte('lng', coords.lng - lngDiff)
            .lte('lng', coords.lng + lngDiff);
        }
      }

      const { data: usPharmacies, error: usError } = await usPharmaciesQuery.order('name');

      if (usError) {
        console.warn('Error fetching US pharmacies:', usError);
      }

      console.log('Fetched US pharmacies:', usPharmacies?.length);
      console.log('First few US pharmacies:', usPharmacies?.slice(0, 3));

      // Map regular pharmacies; mark MedMe-linked ones as type 'medme' and add logo
      const mappedRegularOrMedme = (regularPharmacies || []).map(p => ({
        ...p,
        type: medmePharmacyIds.has(p.id) ? ('medme' as const) : ('regular' as const),
        logoUrl: medmePharmacyIds.has(p.id) ? '/medme-logo.png' : undefined,
      }));

      // Build a set of MedMe names to avoid duplicates from US data
      const medmeNames = new Set(mappedRegularOrMedme.filter(p => p.type === 'medme').map(p => p.name));

      // Filter US data to exclude MedMe-branded entries (by image or name)
      const filteredUSRaw = (usPharmacies || []).filter(up =>
        up.main_image_url !== '/medme-logo.png' && !medmeNames.has(up.name || '') && up.name !== "Preston's Pills"
      );

      // Convert US pharmacies (after filtering)
      const convertedUSPharmacies = filteredUSRaw.map((up: any) => convertUSPharmacy(up as USPharmacy));
      console.log(`🇺🇸 US pharmacies after database filtering: ${convertedUSPharmacies.length}`);
      
      // Combine pharmacies (do not include placeholder MedMe objects)
      let allPharmacies: Pharmacy[] = [
        ...mappedRegularOrMedme,
      ];
      
      // Filter by MedMe only if requested
      if (filters.medmeOnly) {
        allPharmacies = allPharmacies.filter(p => p.type === 'medme');
        console.log(`🔹 MedMe-only filter applied: ${allPharmacies.length} pharmacies`);
      } else {
        // Add US pharmacies if not filtering for MedMe only
        allPharmacies.push(...convertedUSPharmacies);
        console.log(`📍 Total pharmacies (including US): ${allPharmacies.length}`);
      }

      let filteredPharmacies = allPharmacies;

      // If location is provided, apply additional precise distance filtering
      if (filters.location && filters.location.trim()) {
        const coords = await geocodeLocation(filters.location.trim());
        
        if (coords) {
          const radiusKm = filters.radiusKm || 50; // Default to 50km if no radius specified
          console.log(`🎯 Final precision filtering: center(${coords.lat}, ${coords.lng}) radius=${radiusKm}km`);
          console.log(`📊 Pharmacies after database filter: ${filteredPharmacies.length}`);
          
          // Run database verification for debugging
          await verifyDatabaseDistances(coords.lat, coords.lng, radiusKm, filters.location.trim());
          
          // Separate pharmacies by type for different filtering approaches
          const regularAndMedmePharmacies = filteredPharmacies.filter(p => p.type !== 'us');
          const usPharmacies = filteredPharmacies.filter(p => p.type === 'us');
          
          console.log(`🏥 Regular/MedMe pharmacies: ${regularAndMedmePharmacies.length}`);
          console.log(`🇺🇸 US pharmacies (pre-filtered): ${usPharmacies.length}`);
          
          // For regular/MedMe pharmacies, apply JavaScript distance filtering
          const regularPharmaciesWithCoords = regularAndMedmePharmacies.filter(p => p.latitude !== null && p.longitude !== null);
          const regularPharmaciesFiltered = regularPharmaciesWithCoords
            .map(pharmacy => {
              const distance = calculateDistance(coords.lat, coords.lng, pharmacy.latitude!, pharmacy.longitude!);
              return { ...pharmacy, distance };
            })
            .filter(pharmacy => pharmacy.distance <= radiusKm)
            .sort((a, b) => a.distance - b.distance);
          
          // For US pharmacies, apply precise distance filter (they're already roughly filtered by database)
          const usPharmaciesFiltered = usPharmacies
            .map(pharmacy => {
              const distance = calculateDistance(coords.lat, coords.lng, pharmacy.latitude!, pharmacy.longitude!);
              return { ...pharmacy, distance };
            })
            .filter(pharmacy => {
              const isWithinRadius = pharmacy.distance <= radiusKm;
              
              // Log some results for debugging
              if (pharmacy.distance <= radiusKm + 10) { // Log pharmacies within +10km for debugging
                const status = isWithinRadius ? '✅ INCLUDED' : '🚫 EXCLUDED';
                console.log(`${status} ${pharmacy.name}: ${pharmacy.distance.toFixed(2)}km`);
              }
              
              return isWithinRadius;
            })
            .sort((a, b) => a.distance - b.distance);

          console.log(`📍 Regular pharmacies within ${radiusKm}km: ${regularPharmaciesFiltered.length}`);
          console.log(`📍 US pharmacies within ${radiusKm}km: ${usPharmaciesFiltered.length}`);
          
          // Combine results: nearby pharmacies sorted by distance
          const allNearbyPharmacies = [...regularPharmaciesFiltered, ...usPharmaciesFiltered]
            .sort((a, b) => a.distance - b.distance);
          
          if (allNearbyPharmacies.length > 0) {
            console.log(`🏆 CLOSEST pharmacies:`, allNearbyPharmacies.slice(0, 3).map(p => ({
              name: p.name,
              distance: `${p.distance.toFixed(2)}km`,
              type: p.type,
              coordinates: `${p.latitude}, ${p.longitude}`
            })));
          } else {
            console.warn(`❌ NO PHARMACIES found within ${radiusKm}km of ${coords.lat}, ${coords.lng}`);
            
            // Find closest pharmacies regardless of radius for debugging
            const allWithDistances = filteredPharmacies
              .filter(p => p.latitude !== null && p.longitude !== null)
              .map(p => ({
                name: p.name,
                distance: calculateDistance(coords.lat, coords.lng, p.latitude!, p.longitude!),
                type: p.type,
                coordinates: `${p.latitude}, ${p.longitude}`
              }))
              .sort((a, b) => a.distance - b.distance)
              .slice(0, 5);
            
            console.log(`🔍 5 CLOSEST pharmacies (regardless of radius):`, allWithDistances);
          }

          filteredPharmacies = allNearbyPharmacies;
        } else {
          console.warn(`❌ GEOCODING FAILED for "${filters.location.trim()}" - falling back to text search`);
          // Fallback to text search if geocoding fails
          filteredPharmacies = filteredPharmacies.filter(pharmacy => 
            pharmacy.name.toLowerCase().includes(filters.location!.toLowerCase()) ||
            pharmacy.address.toLowerCase().includes(filters.location!.toLowerCase())
          );
          console.log(`📝 Text search fallback found ${filteredPharmacies.length} pharmacies`);
        }
      } else {
        // No location specified - show all pharmacies sorted by name
        filteredPharmacies = filteredPharmacies.sort((a, b) => a.name.localeCompare(b.name));
      }

      // Filter by service if specified
      if (filters.service) {
        const services = Array.isArray(filters.service) ? filters.service : [filters.service];
        console.log(`🔍 Filtering by services: ${services.join(', ')}`);
        
        filteredPharmacies = filteredPharmacies.filter(pharmacy => {
          if (!pharmacy.services || pharmacy.services.length === 0) {
            // If no services data, include all pharmacies for now
            // This could be enhanced to exclude them or mark them differently
            return true;
          }
          
          // Check if any of the pharmacy's services match any of the requested services
          return services.some(requestedService => 
            pharmacy.services!.some(pharmacyService => 
              pharmacyService.toLowerCase().includes(requestedService.toLowerCase()) ||
              requestedService.toLowerCase().includes(pharmacyService.toLowerCase())
            )
          );
        });
        
        console.log(`📋 Found ${filteredPharmacies.length} pharmacies offering services: ${services.join(', ')}`);
      }

      console.log(`📍 Final result: ${filteredPharmacies.length} pharmacies to display`);
      
      // Track search event
      const medmeCount = filteredPharmacies.filter(p => p.type === 'medme').length;
      const serviceForTracking = Array.isArray(filters.service) 
        ? filters.service.join(',') 
        : (filters.service || 'general');
      await AnalyticsService.trackSearch(serviceForTracking, filters.location || 'unknown', filteredPharmacies.length);
      await AnalyticsService.trackResultsShown(serviceForTracking, filteredPharmacies.length, medmeCount);

      // Load pharmacies with basic display data (Mapbox-based implementation)
      const enhancedPharmacies = enhancePharmaciesWithBasicData(filteredPharmacies);
      setPharmacies(enhancedPharmacies);
      console.log(`✅ Loaded ${enhancedPharmacies.length} pharmacies with basic display data`);
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

      // Get regular pharmacies
      const { data: regularPharmacies, error: regularError } = await supabase
        .from('pharmacies')
        .select('*')
        .order('name');

      if (regularError) {
        throw regularError;
      }

      // Get MedMe pharmacies (using only available columns)
      const { data: medmePharmacies, error: medmeError } = await supabase
        .from('medme_pharmacies')
        .select('id, pharmacy_id, is_active')
        .eq('is_active', true);

      if (medmeError) {
        console.warn('Error fetching MedMe pharmacies:', medmeError);
      }

      const medmePharmacyIds = new Set((medmePharmacies || []).map((m: any) => m.pharmacy_id));

      console.log(`✅ Found ${medmePharmacies?.length || 0} active MedMe pharmacies (location data not available in current schema)`);

      // Get US pharmacies
      const { data: usPharmacies, error: usError } = await supabase
        .from('us_pharmacy_data')
        .select('id, name, address, phone, zip_code, state_name, website, opening_hours, ratings, lat, lng, main_image_url')
        .order('name');

      if (usError) {
        console.warn('Error fetching US pharmacies:', usError);
      }

      // Map regular pharmacies and mark MedMe-linked ones
      const mappedRegularOrMedme = (regularPharmacies || []).map(p => ({
        ...p,
        type: medmePharmacyIds.has(p.id) ? ('medme' as const) : ('regular' as const),
        logoUrl: medmePharmacyIds.has(p.id) ? '/medme-logo.png' : undefined,
      }));

      const medmeNames = new Set(mappedRegularOrMedme.filter(p => p.type === 'medme').map(p => p.name));

      const filteredUS = (usPharmacies || []).filter(up => up.main_image_url !== '/medme-logo.png' && !medmeNames.has(up.name || '') && up.name !== "Preston's Pills");

      // Combine all pharmacies
      const allPharmacies: Pharmacy[] = [
        ...mappedRegularOrMedme,
        ...filteredUS.map((up: any) => convertUSPharmacy(up as USPharmacy))
      ];

      // First, quickly load pharmacies with basic display data
      const basicEnhancedPharmacies = enhancePharmaciesWithBasicData(allPharmacies);
      setPharmacies(basicEnhancedPharmacies);
      
      console.log(`⚡ Loaded ${basicEnhancedPharmacies.length} total pharmacies (${regularPharmacies?.length || 0} regular, ${medmePharmacies?.length || 0} MedMe, ${usPharmacies?.length || 0} US)`);
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
        console.warn('⚠️ Could not fetch regular pharmacies (table may be empty):', regularError);
      }

      console.log(`✅ Found ${regularPharmacies?.length || 0} regular pharmacies`);

      // Get MedMe pharmacies (using only available columns)
      const { data: basicMedmePharmacies, error: basicMedmeError } = await supabase
        .from('medme_pharmacies')
        .select('id, pharmacy_id, is_active')
        .eq('is_active', true);

      if (basicMedmeError) {
        console.warn('⚠️ Error fetching MedMe pharmacies:', basicMedmeError);
      }

      console.log(`✅ Found ${basicMedmePharmacies?.length || 0} active MedMe pharmacies`);

      // Get US pharmacies with database-level distance filtering for efficiency
      const latDiff = radiusKm / 111.0; // 1 degree latitude ≈ 111km
      const lngDiff = radiusKm / (111.0 * Math.cos(latitude * Math.PI / 180)); // longitude varies by latitude
      
      const { data: usPharmacies, error: usError } = await supabase
        .from('us_pharmacy_data')
        .select('id, name, address, phone, zip_code, state_name, website, opening_hours, ratings, lat, lng, main_image_url')
        .not('lat', 'is', null)
        .not('lng', 'is', null)
        .gte('lat', latitude - latDiff)
        .lte('lat', latitude + latDiff)
        .gte('lng', longitude - lngDiff)
        .lte('lng', longitude + lngDiff);

      if (usError) {
        console.warn('⚠️ Error fetching US pharmacies:', usError);
      }

      console.log(`✅ Found ${usPharmacies?.length || 0} US pharmacies in database search area`);

      // For now, fetch MedMe pharmacies by joining with pharmacy location data
      const { data: medmePharmacies, error: medmeError } = await supabase
        .from('medme_pharmacies')
        .select(`
          pharmacy_id,
          is_active,
          pharmacies!inner(*)
        `)
        .eq('is_active', true);

      if (medmeError) {
        console.warn('⚠️ Error fetching MedMe pharmacies:', medmeError);
      }

      // For now, skip the complex join and handle MedMe pharmacies from US data
      const validMedmePharmacies: any[] = [];

      console.log(`✅ ${validMedmePharmacies.length} MedMe pharmacies with valid coordinates (using simplified approach)`);

      console.log(`✅ ${validMedmePharmacies.length} MedMe pharmacies with valid coordinates`);

      // Also check US pharmacy data for MedMe pharmacies (Preston's Pills)
      const medmeUSPharmacies = (usPharmacies || []).filter(up => 
        up.main_image_url === '/medme-logo.png' || up.name === "Preston's Pills"
      );
      
      console.log(`✅ Found ${medmeUSPharmacies.length} MedMe pharmacies in US data`);

      // Combine and convert all pharmacies
      let allPharmacies: Pharmacy[] = [
        ...(regularPharmacies || []).map(p => ({ ...p, type: 'regular' as const })),
        ...(usPharmacies || [])
          .filter(up => up.main_image_url !== '/medme-logo.png' && up.name !== "Preston's Pills") // Exclude MedMe ones from regular US data
          .map((up: any) => convertUSPharmacy(up as USPharmacy)),
        ...medmeUSPharmacies.map((up: any) => ({
          ...convertUSPharmacy(up as USPharmacy),
          type: 'medme' as const,
          logoUrl: '/medme-logo.png'
        })),
        ...validMedmePharmacies.map((mp: any) => convertMedMePharmacy({
          ...mp,
          medmeId: mp.medmeId,
          logoUrl: mp.logoUrl
        } as MedMePharmacy & { logoUrl: string }))
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

      // Track nearby search
      const medmeCount = nearbyPharmacies.filter(p => p.type === 'medme').length;
      await AnalyticsService.trackResultsShown('nearby_search', nearbyPharmacies.length, medmeCount);

      // Load nearby pharmacies with basic display data (Mapbox-based implementation)
      const enhancedPharmacies = enhancePharmaciesWithBasicData(nearbyPharmacies);
      setPharmacies(enhancedPharmacies);
      console.log(`✅ Loaded ${enhancedPharmacies.length} nearby pharmacies with basic display data`);
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