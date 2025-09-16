import React from 'react';
import { useGeographic } from '@/contexts/GeographicContext';
import { GEOGRAPHIC_CONFIG } from '@/lib/geo';
import StatePicker from '@/components/geo/StatePicker';
import ProvincePicker from '@/components/geo/ProvincePicker';

const RegionGate: React.FC = () => {
  const { country, isUS, isCA } = useGeographic();

  if (!country) {
    return null;
  }

  const config = GEOGRAPHIC_CONFIG[country];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Select Your {config.regionLabel}
          </h1>
          <p className="text-muted-foreground">
            Choose your {config.regionLabel.toLowerCase()} to find pharmacies near you
          </p>
        </div>
        
        <div className="bg-card rounded-lg p-6 shadow-lg border">
          {isUS && <StatePicker />}
          {isCA && <ProvincePicker />}
        </div>
      </div>
    </div>
  );
};

export default RegionGate;