import { Pharmacy } from "@/hooks/usePharmacySearch";
import { PharmacyCard } from "@/types/pharmacy";

/**
 * Adapter to convert existing Pharmacy interface to the new PharmacyCard interface
 * This allows gradual migration without breaking existing code
 */
export const adaptPharmacyToCard = (pharmacy: Pharmacy): PharmacyCard => {
  // Parse address components
  const addressParts = pharmacy.address.split(',').map(part => part.trim());
  const line1 = addressParts[0] || '';
  const city = addressParts[1] || '';
  const stateZip = addressParts[2] || '';
  // Parse US format: "State ZIP" or "State ZIP-code"
  const stateZipMatch = stateZip.match(/^(.+?)\s+(\d{5}(?:-\d{4})?)$/);
  const state = stateZipMatch ? stateZipMatch[1] : stateZip;
  const zipCode = stateZipMatch ? stateZipMatch[2] : '';

  return {
    id: pharmacy.id,
    source: pharmacy.type === 'medme' ? 'medme' : 'google',
    name: pharmacy.name,
    location: {
      lat: pharmacy.latitude || 0,
      lng: pharmacy.longitude || 0
    },
    address: {
      line1,
      city,
      state: state || '',
      zipCode: zipCode || ''
    },
    phone: pharmacy.phone || undefined,
    website: pharmacy.website || undefined,
    rating: pharmacy.displayData ? {
      value: pharmacy.displayData.rating,
      count: pharmacy.displayData.reviews,
      source: 'internal'
    } : undefined,
    openNow: pharmacy.displayData?.hours.isOpen,
    attributes: pharmacy.displayData?.services || [],
    medmeConnected: pharmacy.type === 'medme',
    nextSlots: pharmacy.type === 'medme' ? [
      new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // Day after
    ] : undefined,
    placeId: undefined, // Mapbox-based implementation doesn't use Google Place IDs
    medmeId: pharmacy.type === 'medme' ? pharmacy.id : undefined
  };
};