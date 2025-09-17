import { useState, useCallback } from 'react';
import { useGeographic } from '@/contexts/GeographicContext';
import { createPharmacyAdapter } from '@/lib/dataAdapters';
import { adaptPharmacyToCard } from './usePharmacyAdapter';
import { PharmacyCard } from '@/types/pharmacy';

export const useGeographicPharmacySearch = () => {
  const { country, region } = useGeographic();
  const [pharmacies, setPharmacies] = useState<PharmacyCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchPharmacies = useCallback(async (params: {
    q?: string;
    services?: string[];
    lat?: number;
    lng?: number;
    radiusKm?: number;
  }) => {
    if (!country) {
      setError('No country selected');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const adapter = createPharmacyAdapter(country);
      const searchParams = {
        ...params,
        region: region || undefined
      };
      
      const results = await adapter.search(searchParams);
      
      // Convert results to PharmacyCard format
      const adaptedResults = results.map((pharmacy: any) => {
        if (country === 'us') {
          // Convert US pharmacy data format to the existing Pharmacy interface first
          const legacyPharmacy = {
            id: pharmacy.id,
            name: pharmacy.name || 'Unknown Pharmacy',
            address: pharmacy.address || '',
            city: '', // Will be parsed from address in adaptPharmacyToCard
            state: pharmacy.state_name || region || '',
            zip_code: pharmacy.zip_code?.toString() || '',
            phone: pharmacy.phone,
            website: pharmacy.website,
            services: [], // Default empty services array
            latitude: pharmacy.lat,
            longitude: pharmacy.lng,
            type: 'us' as const,
            displayData: {
              rating: pharmacy.ratings || 0,
              reviews: 0,
              isAvailable: true,
              services: [],
              nextAvailable: 'Today',
              hours: { 
                isOpen: true,
                hours: '9:00 AM - 9:00 PM',
                status: 'Open',
                nextChange: 'Closes 9:00 PM'
              }
            }
          };
          return adaptPharmacyToCard(legacyPharmacy);
        }
        
        // For CA pharmacies, convert Canadian pharmacy data format
        const legacyPharmacy = {
          id: pharmacy.id,
          name: pharmacy.name || 'Unknown Pharmacy',
          address: pharmacy["Pharmacy Address__street_address"] || 
                  `${pharmacy["Pharmacy Address__street_number"] || ''} ${pharmacy["Pharmacy Address__street_name"] || ''}`.trim(),
          city: pharmacy["Pharmacy Address__city"] || '',
          state: pharmacy.province_code || pharmacy.province || region || '',
          zip_code: pharmacy["Pharmacy Address__postal_code"] || '',
          phone: '', // Not available in the CSV
          website: pharmacy.website,
          services: [], // Default empty services array
          latitude: pharmacy["Pharmacy Address__latitude"],
          longitude: pharmacy["Pharmacy Address__longitude"],
          type: 'medme' as const, // All CA pharmacies are MedMe connected
          displayData: {
            rating: 0, // No rating data in the CSV
            reviews: 0,
            isAvailable: true,
            services: [],
            nextAvailable: 'Today',
            hours: { 
              isOpen: true,
              hours: '9:00 AM - 9:00 PM',
              status: 'Open',
              nextChange: 'Closes 9:00 PM'
            }
          }
        };
        return adaptPharmacyToCard(legacyPharmacy);
      });

      setPharmacies(adaptedResults);
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  }, [country, region]);

  const getNearbyPharmacies = useCallback(async (lat: number, lng: number, radiusKm: number = 10) => {
    return searchPharmacies({ lat, lng, radiusKm });
  }, [searchPharmacies]);

  return {
    pharmacies,
    loading,
    error,
    searchPharmacies,
    getNearbyPharmacies,
    country,
    region
  };
};