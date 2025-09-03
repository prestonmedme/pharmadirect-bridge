// Google Maps API Configuration
// TODO: Move to environment variables for production
export const GOOGLE_MAPS_CONFIG = {
  apiKey: "AIzaSyD5uyr4qbCAZqqoNrMvTg-u9ijT1oohU6E",
  libraries: ["places", "geometry"] as const,
  region: "US", // United States
  language: "en",
} as const;

// Market Configuration
export const MARKET_CONFIG = {
  country: "US",
  region: "California",
  countryCode: "us",
  stateCode: "CA",
  distanceUnits: "miles", // or "km"
} as const;