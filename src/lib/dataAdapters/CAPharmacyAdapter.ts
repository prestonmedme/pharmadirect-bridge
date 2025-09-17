import { PharmacyDataAdapter, PharmacySearchParams } from './PharmacyDataAdapter';
import { supabase } from '@/integrations/supabase/client';

export class CAPharmacyAdapter implements PharmacyDataAdapter {
  async search(params: PharmacySearchParams): Promise<any[]> {
    try {
      let query = (supabase as any)
        .from('ca_medme_pharmacies')
        .select('*');

      // Filter by region (province) if specified
      if (params.region) {
        query = query.eq('province_code', params.region.toUpperCase());
      }

      // Text search across name and city
      if (params.q) {
        query = query.or(`name.ilike.%${params.q}%,"Pharmacy Address__city".ilike.%${params.q}%`);
      }

      // Location-based search
      if (params.lat && params.lng && params.radiusKm) {
        // For now, we'll implement a simple bounding box filter
        // A more sophisticated implementation would use PostGIS
        const latDelta = params.radiusKm / 111; // Rough conversion: 1 degree ≈ 111 km
        const lngDelta = params.radiusKm / (111 * Math.cos(params.lat * Math.PI / 180));
        
        query = query
          .gte('"Pharmacy Address__latitude"', params.lat - latDelta)
          .lte('"Pharmacy Address__latitude"', params.lat + latDelta)
          .gte('"Pharmacy Address__longitude"', params.lng - lngDelta)
          .lte('"Pharmacy Address__longitude"', params.lng + lngDelta);
      }

      const { data, error } = await query.limit(50);

      if (error) {
        console.error('CA pharmacy search error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('CA pharmacy search error:', error);
      return [];
    }
  }

  async getById(id: string): Promise<any | null> {
    try {
      const { data, error } = await (supabase as any)
        .from('ca_medme_pharmacies')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('CA pharmacy getById error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('CA pharmacy getById error:', error);
      return null;
    }
  }

  async getNearby(lat: number, lng: number, radiusKm: number): Promise<any[]> {
    return this.search({ lat, lng, radiusKm });
  }
}