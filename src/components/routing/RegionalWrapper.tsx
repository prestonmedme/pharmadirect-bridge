import React from 'react';
import { Outlet, useParams, Navigate } from 'react-router-dom';
import { GeographicProvider } from '@/contexts/GeographicContext';
import { validateCountryRegion } from '@/lib/geo';
import RegionGate from './RegionGate';

const RegionalWrapper: React.FC = () => {
  const params = useParams<{ country?: string; region?: string }>();
  const country = params.country?.toLowerCase();
  
  // Redirect to home if country is invalid
  if (!country || (country !== 'us' && country !== 'ca')) {
    return <Navigate to="/" replace />;
  }

  // If we have a region, validate it
  const region = params.region?.toUpperCase();
  if (region && !validateCountryRegion(country, region)) {
    return <Navigate to={`/${country}`} replace />;
  }

  return (
    <GeographicProvider>
      <Outlet />
    </GeographicProvider>
  );
};

export default RegionalWrapper;