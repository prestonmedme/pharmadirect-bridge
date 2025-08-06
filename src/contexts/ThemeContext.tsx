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
  const [theme, setTheme] = useState<ThemeConfig>(defaultTheme);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Detect and apply theme on mount
    const detectedTheme = detectTheme();
    setTheme(detectedTheme);
    applyThemeToDocument(detectedTheme);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Apply theme changes
    if (theme) {
      applyThemeToDocument(theme);
    }
  }, [theme]);

  const handleSetTheme = (newTheme: ThemeConfig) => {
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme, isLoading }}>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading theme...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </ThemeContext.Provider>
  );
}