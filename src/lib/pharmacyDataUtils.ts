// Utility functions for generating stable pharmacy data and integrating with Google Places API
import { GOOGLE_MAPS_CONFIG } from './config';

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

// Search for pharmacy using Google Places API
export async function searchPharmacyPlaces(pharmacyName: string, address: string): Promise<GooglePlacesData | null> {
  try {
    if (!window.google || !window.google.maps) {
      console.warn('Google Maps API not loaded');
      return null;
    }

    const service = new window.google.maps.places.PlacesService(
      document.createElement('div')
    );

    const request = {
      query: `${pharmacyName} ${address}`,
      fields: [
        'place_id',
        'name',
        'rating',
        'user_ratings_total',
        'opening_hours',
        'reviews',
        'formatted_address'
      ]
    };

    return new Promise((resolve) => {
      service.textSearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
          const place = results[0];
          resolve({
            place_id: place.place_id,
            rating: place.rating,
            user_ratings_total: place.user_ratings_total,
            opening_hours: place.opening_hours ? {
              open_now: place.opening_hours.open_now ?? false,
              periods: place.opening_hours.periods,
              weekday_text: place.opening_hours.weekday_text
            } : { open_now: false },
            reviews: place.reviews
          });
        } else {
          console.warn(`No Google Places data found for ${pharmacyName} at ${address}`);
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error('Error searching Google Places:', error);
    return null;
  }
}

// Get detailed place information including reviews
export async function getPlaceDetails(placeId: string): Promise<GooglePlacesData | null> {
  try {
    if (!window.google || !window.google.maps) {
      console.warn('Google Maps API not loaded');
      return null;
    }

    const service = new window.google.maps.places.PlacesService(
      document.createElement('div')
    );

    const request = {
      placeId: placeId,
      fields: [
        'name',
        'rating',
        'user_ratings_total',
        'opening_hours',
        'reviews',
        'formatted_address'
      ]
    };

    return new Promise((resolve) => {
      service.getDetails(request, (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
          resolve({
            place_id: placeId,
            rating: place.rating,
            user_ratings_total: place.user_ratings_total,
            opening_hours: place.opening_hours ? {
              open_now: place.opening_hours.open_now ?? false,
              periods: place.opening_hours.periods,
              weekday_text: place.opening_hours.weekday_text
            } : { open_now: false },
            reviews: place.reviews
          });
        } else {
          console.warn(`No place details found for place ID: ${placeId}`);
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error('Error getting place details:', error);
    return null;
  }
}

// Convert Google Places hours to our format
export function convertGoogleHoursToDisplayFormat(googleHours?: any): {
  isOpen: boolean;
  hours: string;
  status: string;
  nextChange: string;
} {
  if (!googleHours) {
    // Fallback to default format
    return {
      isOpen: true,
      hours: "9:00 - 18:00",
      status: "Open",
      nextChange: "Closes at 18:00"
    };
  }

  const isOpen = googleHours.open_now || false;
  
  // Try to get today's hours from weekday_text
  const today = new Date().getDay();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = dayNames[today];
  
  let todayHours = "Hours not available";
  if (googleHours.weekday_text) {
    const todayEntry = googleHours.weekday_text.find((entry: string) => 
      entry.toLowerCase().startsWith(todayName.toLowerCase())
    );
    if (todayEntry) {
      todayHours = todayEntry.split(': ')[1] || todayHours;
    }
  }

  return {
    isOpen,
    hours: todayHours,
    status: isOpen ? "Open" : "Closed",
    nextChange: isOpen ? "Check Google for closing time" : "Check Google for opening time"
  };
}

// Merge Google Places data with stable mock data
export function mergeGooglePlacesData(
  stableData: PharmacyDisplayData, 
  googleData: GooglePlacesData | null
): PharmacyDisplayData {
  if (!googleData) {
    return stableData;
  }

  return {
    ...stableData,
    // Use Google's rating and reviews if available
    rating: googleData.rating ?? stableData.rating,
    reviews: googleData.user_ratings_total ?? stableData.reviews,
    // Use Google's hours if available
    hours: googleData.opening_hours 
      ? convertGoogleHoursToDisplayFormat(googleData.opening_hours)
      : stableData.hours,
    // Keep availability calculation but base it on Google's open_now if available
    isAvailable: googleData.opening_hours?.open_now ?? stableData.isAvailable
  };
}