export interface PharmacySearchParams {
  q?: string;
  region?: string;
  services?: string[];
  lat?: number;
  lng?: number;
  radiusKm?: number;
}

export interface PharmacyDataAdapter {
  search(params: PharmacySearchParams): Promise<any[]>;
  getById(id: string): Promise<any | null>;
  getNearby(lat: number, lng: number, radiusKm: number): Promise<any[]>;
}