export type PharmacyCard = {
  id: string;                       // canonical directory id
  source: 'medme' | 'google';       // origin
  name: string;
  location: { lat: number; lng: number };
  address: { line1: string; city: string; state: string; zipCode: string; country?: string };
  phone?: string;
  website?: string;
  rating?: { value?: number; count?: number; source?: 'google' | 'internal' };
  openNow?: boolean;
  attributes?: string[];            // e.g., '24hr','accessible','drive-thru'
  medmeConnected: boolean;
  nextSlots?: string[];             // ISO; only when medmeConnected
  placeAttributionHtml?: string;    // required when source='google'
  placeId?: string;                 // Google Places lookup
  medmeId?: string;                 // MedMe lookup
};

export type PharmacyDetails = PharmacyCard & {
  openingHours?: {
    isOpen: boolean;
    periods?: any[];
    weekday_text?: string[];
  };
  photos?: google.maps.places.PlacePhoto[];
  mapsUri?: string;
  userRatingsTotal?: number;
  services?: string[];
  availability?: {
    nextSlots: string[];
  };
};

export type PharmacySource = 'medme' | 'google';