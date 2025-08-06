import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { exampleThemes } from '@/lib/theme';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function ThemeDemo() {
  const { theme, setTheme } = useTheme();
  
  const currentThemeKey = Object.keys(exampleThemes).find(
    key => JSON.stringify(exampleThemes[key]) === JSON.stringify(theme)
  ) || 'custom';

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Dynamic Theme Demo
          <Badge variant="outline">Current: {currentThemeKey}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(exampleThemes).map(([key, themeConfig]) => (
            <Card key={key} className="p-4 cursor-pointer hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold capitalize">{key}</h3>
                  {JSON.stringify(themeConfig) === JSON.stringify(theme) && (
                    <Badge variant="default">Active</Badge>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div 
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: themeConfig.primaryColor }}
                      title="Primary Color"
                    />
                    <div 
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: themeConfig.secondaryColor }}
                      title="Secondary Color"
                    />
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    Font: {themeConfig.fontFamily.split(',')[0]}
                  </p>
                  
                  <p className="text-sm text-muted-foreground">
                    Style: {themeConfig.ctaStyle}
                  </p>
                </div>
                
                <Button 
                  size="sm" 
                  variant="outline"
                  className="w-full"
                  onClick={() => setTheme(themeConfig)}
                >
                  Apply Theme
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="border-t pt-6">
          <h3 className="font-semibold mb-4">URL-based Theme Testing</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium">Subdomain examples:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>vancouver.medme.ca → Vancouver theme</li>
                <li>pharmaplus.medme.ca → PharmaPlus theme</li>
              </ul>
            </div>
            <div>
              <p className="font-medium">Query string examples:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>?theme=vancouver → Vancouver theme</li>
                <li>?theme=pharmaplus → PharmaPlus theme</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}