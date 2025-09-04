// Mapbox Configuration
export const MAPBOX_CONFIG = {
  region: "US", // United States
  language: "en",
  style: "mapbox://styles/mapbox/streets-v12", // Default style
  fallbackStyle: "mapbox://styles/mapbox/light-v11", // Fallback style
} as const;

// Market Configuration
export const MARKET_CONFIG = {
  country: "US",
  region: "California",
  countryCode: "us",
  stateCode: "CA",
  distanceUnits: "miles", // or "km"
} as const;