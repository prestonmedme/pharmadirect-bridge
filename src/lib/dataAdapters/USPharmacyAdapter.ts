import { supabase } from '@/integrations/supabase/client';
import { PharmacyDataAdapter, PharmacySearchParams } from './PharmacyDataAdapter';

export class USPharmacyAdapter implements PharmacyDataAdapter {
  async search(params: PharmacySearchParams): Promise<any[]> {
    let query = supabase.from('us_pharmacy_data').select('*');
    
    // Filter by name if search query provided
    if (params.q) {
      query = query.ilike('name', `%${params.q}%`);
    }
    
    // Add geographic filtering if coordinates provided
    if (params.lat && params.lng && params.radiusKm) {
      // This is a simplified distance filter - in production you'd use PostGIS
      const latDelta = params.radiusKm / 111; // Rough km to degree conversion
      const lngDelta = params.radiusKm / (111 * Math.cos(params.lat * Math.PI / 180));
      
      query = query
        .gte('lat', params.lat - latDelta)
        .lte('lat', params.lat + latDelta)
        .gte('lng', params.lng - lngDelta)
        .lte('lng', params.lng + lngDelta);
    }
    
    const { data, error } = await query.limit(50);
    
    if (error) {
      console.error('Error searching US pharmacies:', error);
      return [];
    }
    
    return data || [];
  }

  async getById(id: string): Promise<any | null> {
    const { data, error } = await supabase
      .from('us_pharmacy_data')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching US pharmacy by ID:', error);
      return null;
    }
    
    return data;
  }

  async getNearby(lat: number, lng: number, radiusKm: number): Promise<any[]> {
    return this.search({ lat, lng, radiusKm });
  }
}