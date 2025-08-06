import React, { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { useTheme } from '@/contexts/ThemeContext';
import { exampleThemes, ThemeConfig } from '@/lib/theme';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export function ThemeDemo() {
  const { theme, setTheme } = useTheme();
  const [customPrimaryColor, setCustomPrimaryColor] = useState(theme?.primaryColor || '#007acc');
  const [customSecondaryColor, setCustomSecondaryColor] = useState(theme?.secondaryColor || '#00b2a9');
  const [primaryHex, setPrimaryHex] = useState(theme?.primaryColor || '#007acc');
  const [secondaryHex, setSecondaryHex] = useState(theme?.secondaryColor || '#00b2a9');
  
  const currentThemeKey = Object.keys(exampleThemes).find(
    key => JSON.stringify(exampleThemes[key]) === JSON.stringify(theme)
  ) || 'custom';

  const applyCustomTheme = () => {
    const customTheme: ThemeConfig = {
      ...theme,
      primaryColor: customPrimaryColor,
      secondaryColor: customSecondaryColor,
      logoUrl: theme?.logoUrl || exampleThemes.default.logoUrl,
      fontFamily: theme?.fontFamily || exampleThemes.default.fontFamily,
      ctaStyle: theme?.ctaStyle || exampleThemes.default.ctaStyle
    };
    setTheme(customTheme);
  };

  const handlePrimaryHexChange = (value: string) => {
    setPrimaryHex(value);
    if (/^#[0-9A-F]{6}$/i.test(value)) {
      setCustomPrimaryColor(value);
    }
  };

  const handleSecondaryHexChange = (value: string) => {
    setSecondaryHex(value);
    if (/^#[0-9A-F]{6}$/i.test(value)) {
      setCustomSecondaryColor(value);
    }
  };

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

        <Separator className="my-6" />

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-4">Custom Color Theme</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Create your own theme by selecting custom colors using the color picker or entering hex codes.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Primary Color</Label>
                <div className="mt-2 space-y-3">
                  <div className="w-full max-w-[200px]">
                    <HexColorPicker 
                      color={customPrimaryColor} 
                      onChange={setCustomPrimaryColor}
                      style={{ width: '100%', height: '150px' }}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={primaryHex}
                      onChange={(e) => handlePrimaryHexChange(e.target.value)}
                      placeholder="#007acc"
                      className="font-mono text-sm"
                    />
                    <div 
                      className="w-8 h-8 rounded border border-border"
                      style={{ backgroundColor: customPrimaryColor }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Secondary Color</Label>
                <div className="mt-2 space-y-3">
                  <div className="w-full max-w-[200px]">
                    <HexColorPicker 
                      color={customSecondaryColor} 
                      onChange={setCustomSecondaryColor}
                      style={{ width: '100%', height: '150px' }}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={secondaryHex}
                      onChange={(e) => handleSecondaryHexChange(e.target.value)}
                      placeholder="#00b2a9"
                      className="font-mono text-sm"
                    />
                    <div 
                      className="w-8 h-8 rounded border border-border"
                      style={{ backgroundColor: customSecondaryColor }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-start">
            <Button onClick={applyCustomTheme} className="px-6">
              Apply Custom Theme
            </Button>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="space-y-4">
          <h3 className="font-semibold">URL-based Theme Testing</h3>
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