// Geographic constants and types for US/CA routing system

export const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
] as const;

export const CA_PROVINCES = [
  'AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'
] as const;

export type Country = 'us' | 'ca';
export type RegionCode = string;

export interface GeographicConfig {
  code: Country;
  name: string;
  regions: readonly string[];
  regionLabel: string;
}

export const GEOGRAPHIC_CONFIG: Record<Country, GeographicConfig> = {
  us: {
    code: 'us',
    name: 'United States',
    regions: US_STATES,
    regionLabel: 'State'
  },
  ca: {
    code: 'ca',
    name: 'Canada',
    regions: CA_PROVINCES,
    regionLabel: 'Province'
  }
} as const;

export const validateCountryRegion = (country: string, region?: string): boolean => {
  if (!country || (country !== 'us' && country !== 'ca')) {
    return false;
  }
  
  if (!region) {
    return true; // Country valid, region optional
  }
  
  return GEOGRAPHIC_CONFIG[country as Country].regions.includes(region.toUpperCase());
};