import React, { createContext, useContext, useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Country, RegionCode, validateCountryRegion } from '@/lib/geo';

interface GeographicContextType {
  country: Country | null;
  region: RegionCode | null;
  valid: boolean;
  setCountry: (country: Country) => void;
  setRegion: (region: RegionCode | null) => void;
  isUS: boolean;
  isCA: boolean;
}

const GeographicContext = createContext<GeographicContextType | null>(null);

export const useGeographic = () => {
  const context = useContext(GeographicContext);
  if (!context) {
    throw new Error('useGeographic must be used within a GeographicProvider');
  }
  return context;
};

interface GeographicProviderProps {
  children: React.ReactNode;
}

export const GeographicProvider: React.FC<GeographicProviderProps> = ({ children }) => {
  const params = useParams<{ country?: string; region?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [country, setCountryState] = useState<Country | null>(null);
  const [region, setRegionState] = useState<RegionCode | null>(null);
  const [valid, setValid] = useState(false);

  // Sync state with URL params
  useEffect(() => {
    const urlCountry = params.country?.toLowerCase();
    const urlRegion = params.region?.toUpperCase();
    
    if (urlCountry && (urlCountry === 'us' || urlCountry === 'ca')) {
      setCountryState(urlCountry as Country);
      setRegionState(urlRegion || null);
      setValid(true); // Country is valid, region is optional
    } else {
      setCountryState(null);
      setRegionState(null);
      setValid(false);
    }
  }, [params.country, params.region]);

  const setCountry = (newCountry: Country) => {
    navigate(`/${newCountry}`);
  };

  const setRegion = (newRegion: RegionCode | null) => {
    if (country) {
      if (newRegion) {
        navigate(`/${country}/${newRegion.toUpperCase()}`);
      } else {
        navigate(`/${country}`);
      }
    }
  };

  const isUS = country === 'us';
  const isCA = country === 'ca';

  const value: GeographicContextType = {
    country,
    region,
    valid,
    setCountry,
    setRegion,
    isUS,
    isCA
  };

  return (
    <GeographicContext.Provider value={value}>
      {children}
    </GeographicContext.Provider>
  );
};