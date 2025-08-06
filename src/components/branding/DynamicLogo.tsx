import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import medmeLogo from '@/assets/medme-logo.svg';

interface DynamicLogoProps {
  className?: string;
  alt?: string;
}

export function DynamicLogo({ className = "h-8 w-auto", alt = "Logo" }: DynamicLogoProps) {
  const { theme } = useTheme();
  
  return (
    <img 
      src={theme?.logoUrl || medmeLogo} 
      alt={alt}
      className={className}
      onError={(e) => {
        // Fallback to default logo if custom logo fails to load
        const target = e.target as HTMLImageElement;
        target.src = medmeLogo;
      }}
    />
  );
}