// California pharmacy sample data for US market entry
// This data can be used to populate the database with California-specific pharmacies

export interface CaliforniaPharmacyData {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  phone?: string;
  chain?: string;
  services?: string[];
}

// Major pharmacy chains and independent pharmacies in California
export const CALIFORNIA_PHARMACY_DATA: CaliforniaPharmacyData[] = [
  // Los Angeles Area
  {
    name: "CVS Pharmacy",
    address: "6767 Sunset Blvd",
    city: "Hollywood",
    state: "California",
    zipCode: "90028",
    latitude: 34.0983,
    longitude: -118.3267,
    phone: "(323) 467-4056",
    chain: "CVS",
    services: ["Flu shots", "Vaccinations", "Pharmacy", "Health screenings"]
  },
  {
    name: "Walgreens",
    address: "1201 N Vine St",
    city: "Hollywood",
    state: "California", 
    zipCode: "90038",
    latitude: 34.0928,
    longitude: -118.3267,
    phone: "(323) 463-4707",
    chain: "Walgreens",
    services: ["Pharmacy", "Photo", "Health clinic", "Vaccinations"]
  },
  
  // San Francisco Area
  {
    name: "Walgreens",
    address: "135 Powell St",
    city: "San Francisco",
    state: "California",
    zipCode: "94102",
    latitude: 37.7866,
    longitude: -122.4081,
    phone: "(415) 391-4433",
    chain: "Walgreens",
    services: ["Pharmacy", "Vaccinations", "Health screenings"]
  },
  {
    name: "CVS Pharmacy",
    address: "731 Market St",
    city: "San Francisco", 
    state: "California",
    zipCode: "94103",
    latitude: 37.7863,
    longitude: -122.4056,
    phone: "(415) 974-0999",
    chain: "CVS",
    services: ["Pharmacy", "MinuteClinic", "Flu shots", "Health screenings"]
  },
  
  // San Diego Area
  {
    name: "Rite Aid Pharmacy",
    address: "3911 30th St",
    city: "San Diego",
    state: "California",
    zipCode: "92104",
    latitude: 32.7442,
    longitude: -117.1281,
    phone: "(619) 574-4992",
    chain: "Rite Aid",
    services: ["Pharmacy", "Vaccinations", "Health consultations"]
  },
  {
    name: "CVS Pharmacy",
    address: "8879 Villa La Jolla Dr",
    city: "La Jolla",
    state: "California",
    zipCode: "92037",
    latitude: 32.8672,
    longitude: -117.2436,
    phone: "(858) 457-4390",
    chain: "CVS",
    services: ["Pharmacy", "MinuteClinic", "Vaccinations", "Health screenings"]
  },

  // Sacramento Area  
  {
    name: "Walgreens",
    address: "1601 Alhambra Blvd",
    city: "Sacramento",
    state: "California",
    zipCode: "95816",
    latitude: 38.5687,
    longitude: -121.4511,
    phone: "(916) 455-8241",
    chain: "Walgreens",
    services: ["Pharmacy", "Vaccinations", "Health clinic"]
  },
  
  // Fresno Area
  {
    name: "CVS Pharmacy", 
    address: "7270 N Cedar Ave",
    city: "Fresno",
    state: "California",
    zipCode: "93720",
    latitude: 36.8330,
    longitude: -119.7624,
    phone: "(559) 432-7000",
    chain: "CVS",
    services: ["Pharmacy", "Vaccinations", "Health screenings"]
  },

  // Independent pharmacies
  {
    name: "Bay Cities Pharmacy",
    address: "2721 Wilshire Blvd",
    city: "Santa Monica",
    state: "California", 
    zipCode: "90403",
    latitude: 34.0362,
    longitude: -118.4803,
    phone: "(310) 828-1480",
    chain: "Independent",
    services: ["Compounding", "Pharmacy", "Delivery", "Vaccinations"]
  },
  {
    name: "Golden Gate Pharmacy",
    address: "1748 Divisadero St",
    city: "San Francisco",
    state: "California",
    zipCode: "94115", 
    latitude: 37.7844,
    longitude: -122.4381,
    phone: "(415) 346-3400",
    chain: "Independent",
    services: ["Compounding", "Pharmacy", "Delivery", "Health consultations"]
  }
];

// Function to insert California pharmacy data into database
export const insertCaliforniaPharmacyData = async (supabase: any) => {
  const { data, error } = await supabase
    .from('pharmacies')
    .insert(
      CALIFORNIA_PHARMACY_DATA.map(pharmacy => ({
        name: pharmacy.name,
        address: pharmacy.address,
        phone: pharmacy.phone,
        latitude: pharmacy.latitude,
        longitude: pharmacy.longitude,
        country: 'US',
        state: pharmacy.state,
        zip_code: pharmacy.zipCode,
        formatted_address: `${pharmacy.address}, ${pharmacy.city}, ${pharmacy.state} ${pharmacy.zipCode}`,
        // Convert services array to JSON if needed by your schema
        services: pharmacy.services ? JSON.stringify(pharmacy.services) : null,
        chain: pharmacy.chain,
        // Add any other fields your schema requires
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))
    );

  if (error) {
    console.error('Error inserting California pharmacy data:', error);
    throw error;
  }

  console.log(`Successfully inserted ${data?.length || 0} California pharmacies`);
  return data;
};