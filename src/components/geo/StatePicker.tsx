import React from 'react';
import { useGeographic } from '@/contexts/GeographicContext';
import { GEOGRAPHIC_CONFIG } from '@/lib/geo';
import RegionPicker from './RegionPicker';

const StatePicker: React.FC = () => {
  const { region, setRegion } = useGeographic();
  
  return (
    <RegionPicker
      regions={GEOGRAPHIC_CONFIG.us.regions}
      value={region}
      onValueChange={setRegion}
      placeholder="Choose a state..."
      label="State"
    />
  );
};

export default StatePicker;