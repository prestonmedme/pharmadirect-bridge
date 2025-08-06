import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface ThemedButtonProps extends ButtonProps {
  children: React.ReactNode;
}

export function ThemedButton({ className, children, ...props }: ThemedButtonProps) {
  const { theme } = useTheme();
  
  const getButtonClassName = () => {
    switch (theme.ctaStyle) {
      case 'pill':
        return 'rounded-full';
      case 'block':
        return 'rounded-none';
      default:
        return '';
    }
  };
  
  return (
    <Button 
      className={cn(getButtonClassName(), className)} 
      {...props}
    >
      {children}
    </Button>
  );
}