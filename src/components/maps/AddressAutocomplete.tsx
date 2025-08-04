import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { GOOGLE_MAPS_CONFIG } from '@/lib/config';
import { Loader2 } from 'lucide-react';

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect?: (place: google.maps.places.PlaceResult) => void;
  placeholder?: string;
  className?: string;
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  onChange,
  onPlaceSelect,
  placeholder = "Enter address or location",
  className
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [suppressOnChange, setSuppressOnChange] = useState(false);

  useEffect(() => {
    const checkGoogleMaps = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        setIsGoogleLoaded(true);
        setIsLoading(false);
        return true;
      }
      return false;
    };

    // Check if Google Maps is already loaded
    if (checkGoogleMaps()) {
      return;
    }

    // If not loaded, wait for it to load
    const interval = setInterval(() => {
      if (checkGoogleMaps()) {
        clearInterval(interval);
      }
    }, 100);

    // Cleanup interval after 10 seconds
    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (!isGoogleLoaded) {
        setIsLoading(false);
        console.error('Google Maps failed to load within timeout');
      }
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isGoogleLoaded]);

  useEffect(() => {
    if (!isGoogleLoaded || !inputRef.current || autocompleteRef.current) {
      return;
    }

    try {
      // Initialize autocomplete
      const autocomplete = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ['geocode', 'establishment'],
          componentRestrictions: { country: 'ca' }, // Restrict to Canada
          fields: [
            'place_id',
            'formatted_address', 
            'name',
            'geometry.location',
            'address_components',
            'types'
          ]
        }
      );

      autocompleteRef.current = autocomplete;

      // Handle place selection
      const handlePlaceChanged = () => {
        const place = autocomplete.getPlace();
        
        console.log('Place changed:', place);
        
        if (!place.geometry || !place.geometry.location) {
          console.warn('No location data for selected place');
          return;
        }

        // Temporarily suppress onChange to prevent conflicts
        setSuppressOnChange(true);
        
        // Update input value with formatted address
        const displayAddress = place.formatted_address || place.name || '';
        console.log('Setting display address:', displayAddress);
        
        // Update the input field directly to ensure it shows the selected address
        if (inputRef.current) {
          inputRef.current.value = displayAddress;
        }
        
        // Call onChange after a brief delay to ensure the input is updated
        setTimeout(() => {
          onChange(displayAddress);
          setSuppressOnChange(false);
        }, 10);

        // Call the callback with full place details
        if (onPlaceSelect) {
          onPlaceSelect(place);
        }
      };

      autocomplete.addListener('place_changed', handlePlaceChanged);

      // Cleanup function
      return () => {
        if (autocompleteRef.current) {
          window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
          autocompleteRef.current = null;
        }
      };
    } catch (error) {
      console.error('Error initializing autocomplete:', error);
      setIsLoading(false);
    }
  }, [isGoogleLoaded, onChange, onPlaceSelect]);

  // Handle manual input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!suppressOnChange) {
      onChange(e.target.value);
    }
  };

  if (isLoading) {
    return (
      <div className="relative">
        <Input
          disabled
          placeholder="Loading autocomplete..."
          className={className}
        />
        <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isGoogleLoaded) {
    // Fallback to regular input if Google Maps fails to load
    return (
      <Input
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={className}
      />
    );
  }

  return (
    <Input
      ref={inputRef}
      value={value}
      onChange={handleInputChange}
      placeholder={placeholder}
      className={className}
      autoComplete="off"
    />
  );
};

export default AddressAutocomplete;