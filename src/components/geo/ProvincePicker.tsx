import React from 'react';
import { useGeographic } from '@/contexts/GeographicContext';
import { GEOGRAPHIC_CONFIG } from '@/lib/geo';
import RegionPicker from './RegionPicker';

const ProvincePicker: React.FC = () => {
  const { region, setRegion } = useGeographic();
  
  return (
    <RegionPicker
      regions={GEOGRAPHIC_CONFIG.ca.regions}
      value={region}
      onValueChange={setRegion}
      placeholder="Choose a province..."
      label="Province"
    />
  );
};

export default ProvincePicker;