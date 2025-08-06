import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeConfig, detectTheme, applyThemeToDocument, defaultTheme } from '@/lib/theme';

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
  const [isLoading, setIsLoading] = useState(false); // Set to false initially to avoid loading screen

  useEffect(() => {
    console.log('ThemeProvider: useEffect running - detecting theme');
    try {
      // Detect and apply theme on mount
      const detectedTheme = detectTheme();
      console.log('ThemeProvider: Detected theme:', detectedTheme);
      setTheme(detectedTheme);
      applyThemeToDocument(detectedTheme);
      console.log('ThemeProvider: Theme applied successfully');
    } catch (error) {
      console.error('ThemeProvider: Error in theme initialization:', error);
      // Keep default theme on error
    }
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