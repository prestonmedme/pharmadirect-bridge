import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeConfig, detectThemeAsync, applyThemeToDocument, defaultTheme } from '@/lib/theme';
import { supabase } from '@/integrations/supabase/client';

interface ThemeContextType {
  theme: ThemeConfig;
  setTheme: (theme: ThemeConfig) => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: defaultTheme,
  setTheme: () => {},
  isLoading: false
});

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  console.log('ThemeProvider: Starting ThemeProvider initialization');
  const [theme, setTheme] = useState<ThemeConfig>(defaultTheme);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log('ThemeProvider: useEffect running - detecting theme async');
    const loadTheme = async () => {
      setIsLoading(true);
      try {
        // Detect and apply theme on mount
        const detectedTheme = await detectThemeAsync();
        console.log('ThemeProvider: Detected theme:', detectedTheme);
        setTheme(detectedTheme);
        applyThemeToDocument(detectedTheme);
        console.log('ThemeProvider: Theme applied successfully');
      } catch (error) {
        console.error('ThemeProvider: Error in theme initialization:', error);
        // Keep default theme on error
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();

    // Listen for real-time brand configuration changes
    const channel = supabase
      .channel('brand-config-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'brand_configurations'
        },
        async (payload) => {
          console.log('ThemeProvider: Brand configuration changed', payload);
          // Reload theme when brand configurations change
          try {
            const detectedTheme = await detectThemeAsync();
            setTheme(detectedTheme);
            applyThemeToDocument(detectedTheme);
          } catch (error) {
            console.error('ThemeProvider: Error reloading theme after change:', error);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    // Apply theme changes
    if (theme) {
      console.log('ThemeProvider: Applying theme update:', theme);
      try {
        applyThemeToDocument(theme);
      } catch (error) {
        console.error('ThemeProvider: Error applying theme:', error);
      }
    }
  }, [theme]);

  const handleSetTheme = (newTheme: ThemeConfig) => {
    console.log('ThemeProvider: Setting new theme:', newTheme);
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
}