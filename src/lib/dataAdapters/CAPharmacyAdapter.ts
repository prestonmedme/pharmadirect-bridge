import { PharmacyDataAdapter, PharmacySearchParams } from './PharmacyDataAdapter';
import { supabase } from '@/integrations/supabase/client';

export class CAPharmacyAdapter implements PharmacyDataAdapter {
  async search(params: PharmacySearchParams): Promise<any[]> {
    try {
      let query = supabase
        .from('ca_pharmacy_data')
        .select('*');

      // Filter by region (province) if specified
      if (params.region) {
        query = query.eq('province', params.region.toUpperCase());
      }

      // Text search across name and city
      if (params.q) {
        query = query.or(`name.ilike.%${params.q}%,address_city.ilike.%${params.q}%`);
      }

      // Location-based search
      if (params.lat && params.lng && params.radiusKm) {
        // For now, we'll implement a simple bounding box filter
        // A more sophisticated implementation would use PostGIS
        const latDelta = params.radiusKm / 111; // Rough conversion: 1 degree ≈ 111 km
        const lngDelta = params.radiusKm / (111 * Math.cos(params.lat * Math.PI / 180));
        
        query = query
          .gte('lat', params.lat - latDelta)
          .lte('lat', params.lat + latDelta)
          .gte('lng', params.lng - lngDelta)
          .lte('lng', params.lng + lngDelta);
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
      const { data, error } = await supabase
        .from('ca_pharmacy_data')
        .select('*')
        .eq('medme_id', id)
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