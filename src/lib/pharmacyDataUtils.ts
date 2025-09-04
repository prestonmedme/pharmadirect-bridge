// Utility functions for generating stable pharmacy data
// Note: Migrated from Google Places API to Mapbox Geocoding

export interface PharmacyDisplayData {
  rating: number;
  reviews: number;
  isAvailable: boolean;
  services: string[];
  nextAvailable: string;
  hours: {
    isOpen: boolean;
    hours: string;
    status: string;
    nextChange: string;
  };
  distance?: string;
}

// Legacy interfaces for compatibility during migration
export interface GooglePlacesData {
  place_id?: string;
  rating?: number;
  user_ratings_total?: number;
  opening_hours?: {
    open_now: boolean;
    periods?: any[];
    weekday_text?: string[];
  };
  reviews?: any[];
}

// Simple hash function to generate consistent values from pharmacy ID
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

// Generate stable random number between 0 and 1 using pharmacy ID as seed
function seededRandom(seed: string, offset: number = 0): number {
  const hash = hashString(seed + offset.toString());
  return (hash % 10000) / 10000;
}

// Generate stable mock data that doesn't change between renders
export function generateStableDisplayData(pharmacyId: string, pharmacyName: string, index: number): PharmacyDisplayData {
  const mockServices = [
    ["Minor ailments", "Flu shots", "Travel Vaccines"],
    ["MedsCheck", "Birth Control", "Diabetes"],
    ["Mental Health", "Naloxone Kits", "Pediatric Vax"],
    ["Prescription refills", "Blood pressure checks"],
    ["Vaccinations", "Health screenings", "Consultations"]
  ];

  // Use pharmacy ID to generate consistent values
  const ratingSeed = seededRandom(pharmacyId, 1);
  const reviewsSeed = seededRandom(pharmacyId, 2);
  const availabilitySeed = seededRandom(pharmacyId, 3);
  const distanceSeed = seededRandom(pharmacyId, 4);

  // Generate realistic hours and open/closed status
  const hours = generateStableHours(pharmacyId, pharmacyName);

  return {
    rating: Number((ratingSeed * 1.5 + 3.5).toFixed(1)),
    reviews: Math.floor(reviewsSeed * 200 + 50),
    isAvailable: availabilitySeed > 0.3,
    services: mockServices[index % mockServices.length],
    nextAvailable: availabilitySeed > 0.5 ? "Today" : "Tomorrow",
    hours,
    distance: `${(distanceSeed * 5 + 0.5).toFixed(1)} km`
  };
}

// Generate stable hours based on pharmacy ID
function generateStableHours(pharmacyId: string, pharmacyName: string) {
  const now = new Date();
  const currentHour = now.getHours();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
  
  // Different hour patterns for different pharmacy types
  const hourPatterns = [
    { open: 8, close: 22, name: "Extended Hours" }, // 8 AM - 10 PM
    { open: 9, close: 18, name: "Regular Hours" },   // 9 AM - 6 PM  
    { open: 7, close: 23, name: "24/7 Style" },      // 7 AM - 11 PM
    { open: 8, close: 20, name: "Standard" },        // 8 AM - 8 PM
  ];
  
  // Use consistent pattern based on pharmacy name/ID
  const patternIndex = hashString(pharmacyId) % hourPatterns.length;
  const pattern = hourPatterns[patternIndex];
  
  // Adjust for weekends
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const openTime = isWeekend ? pattern.open + 1 : pattern.open;
  const closeTime = isWeekend ? pattern.close - 2 : pattern.close;
  
  const isOpen = currentHour >= openTime && currentHour < closeTime;
  
  return {
    isOpen,
    hours: `${openTime}:00 - ${closeTime}:00`,
    status: isOpen ? "Open" : "Closed",
    nextChange: isOpen 
      ? `Closes at ${closeTime}:00`
      : `Opens at ${openTime}:00`
  };
}

// Legacy compatibility functions (now return mock data or null)
export async function searchPharmacyPlaces(pharmacyName: string, address: string, opts?: any): Promise<GooglePlacesData | null> {
  console.warn('searchPharmacyPlaces is deprecated - using Mapbox geocoding instead');
  return null; // Return null to indicate no Google Places data
}

export async function getPlaceDetails(placeId: string): Promise<GooglePlacesData | null> {
  console.warn('getPlaceDetails is deprecated - using Mapbox geocoding instead');
  return null; // Return null to indicate no Google Places data
}

export function mergeGooglePlacesData(
  stableData: PharmacyDisplayData, 
  googleData: GooglePlacesData | null
): PharmacyDisplayData {
  // Since Google Places is deprecated, just return stable data
  return stableData;
}

// Convert legacy Google Places hours to display format (fallback)
export function convertGoogleHoursToDisplayFormat(googleHours?: any): {
  isOpen: boolean;
  hours: string;
  status: string;
  nextChange: string;
} {
  // Fallback to default format since Google Places is deprecated
  return {
    isOpen: true,
    hours: "9:00 - 18:00",
    status: "Open",
    nextChange: "Closes at 18:00"
  };
}