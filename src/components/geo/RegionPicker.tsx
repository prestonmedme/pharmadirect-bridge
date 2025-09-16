import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface RegionPickerProps {
  regions: readonly string[];
  value?: string | null;
  onValueChange: (value: string) => void;
  placeholder: string;
  label: string;
}

const RegionPicker: React.FC<RegionPickerProps> = ({
  regions,
  value,
  onValueChange,
  placeholder,
  label
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">
        {label}
      </label>
      <Select value={value || ''} onValueChange={onValueChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {regions.map((region) => (
            <SelectItem key={region} value={region}>
              {region}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default RegionPicker;