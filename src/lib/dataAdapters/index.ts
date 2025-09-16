import { Country } from '@/lib/geo';
import { PharmacyDataAdapter } from './PharmacyDataAdapter';
import { USPharmacyAdapter } from './USPharmacyAdapter';
import { CAPharmacyAdapter } from './CAPharmacyAdapter';

export const createPharmacyAdapter = (country: Country): PharmacyDataAdapter => {
  switch (country) {
    case 'us':
      return new USPharmacyAdapter();
    case 'ca':
      return new CAPharmacyAdapter();
    default:
      throw new Error(`Unsupported country: ${country}`);
  }
};

export * from './PharmacyDataAdapter';
export * from './USPharmacyAdapter';
export * from './CAPharmacyAdapter';