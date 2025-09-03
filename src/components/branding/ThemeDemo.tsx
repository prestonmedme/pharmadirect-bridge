import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { useTheme } from '@/contexts/ThemeContext';
import { exampleThemes, ThemeConfig } from '@/lib/theme';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload, X } from 'lucide-react';

export function ThemeDemo() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [customPrimaryColor, setCustomPrimaryColor] = useState(theme?.primaryColor || '#007acc');
  const [customSecondaryColor, setCustomSecondaryColor] = useState(theme?.secondaryColor || '#00b2a9');
  const [primaryHex, setPrimaryHex] = useState(theme?.primaryColor || '#007acc');
  const [secondaryHex, setSecondaryHex] = useState(theme?.secondaryColor || '#00b2a9');
  const [gradientEnabled, setGradientEnabled] = useState(theme?.gradientEnabled !== false);
  const [gradientStartColor, setGradientStartColor] = useState(theme?.gradientStartColor || theme?.primaryColor || '#007acc');
  const [gradientEndColor, setGradientEndColor] = useState(theme?.gradientEndColor || theme?.secondaryColor || '#00b2a9');
  const [gradientStartHex, setGradientStartHex] = useState(theme?.gradientStartColor || theme?.primaryColor || '#007acc');
  const [gradientEndHex, setGradientEndHex] = useState(theme?.gradientEndColor || theme?.secondaryColor || '#00b2a9');
  const [customLogoUrl, setCustomLogoUrl] = useState(theme?.logoUrl || '');
  const [uploading, setUploading] = useState(false);
  
  const currentThemeKey = Object.keys(exampleThemes).find(
    key => JSON.stringify(exampleThemes[key]) === JSON.stringify(theme)
  ) || 'custom';

  const uploadLogo = async (file: File) => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath);

      setCustomLogoUrl(publicUrl);
      
      toast({
        title: "Logo uploaded successfully",
        description: "Your logo has been uploaded and is ready to use.",
      });

      return publicUrl;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message || "Failed to upload logo",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please select a file smaller than 5MB",
        });
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please select an image file",
        });
        return;
      }
      
      uploadLogo(file);
    }
  };

  const applyCustomTheme = () => {
    const customTheme: ThemeConfig = {
      ...theme,
      primaryColor: customPrimaryColor,
      secondaryColor: customSecondaryColor,
      gradientEnabled,
      gradientStartColor,
      gradientEndColor,
      logoUrl: customLogoUrl || theme?.logoUrl || exampleThemes.default.logoUrl,
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

  const handleGradientStartHexChange = (value: string) => {
    setGradientStartHex(value);
    if (/^#[0-9A-F]{6}$/i.test(value)) {
      setGradientStartColor(value);
    }
  };

  const handleGradientEndHexChange = (value: string) => {
    setGradientEndHex(value);
    if (/^#[0-9A-F]{6}$/i.test(value)) {
      setGradientEndColor(value);
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

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-4">Custom Logo</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Upload your own logo to customize the branding. Supported formats: PNG, JPG, SVG (max 5MB).
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Current Logo</Label>
              <div className="mt-2 p-4 border border-border rounded-lg bg-muted/50">
                {customLogoUrl ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={customLogoUrl} 
                        alt="Custom logo" 
                        className="h-12 w-auto object-contain"
                      />
                      <div className="text-sm">
                        <p className="font-medium">Custom logo uploaded</p>
                        <p className="text-muted-foreground">Ready to use</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCustomLogoUrl('')}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-8 text-muted-foreground">
                    <div className="text-center space-y-2">
                      <Upload className="h-8 w-8 mx-auto" />
                      <p className="text-sm">No custom logo uploaded</p>
                      <p className="text-xs">Using default theme logo</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Upload New Logo</Label>
              <div className="mt-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={uploading}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
                {uploading && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Uploading logo...
                  </p>
                )}
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

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-4">Gradient Background Settings</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Control gradient backgrounds and customize gradient colors.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="gradient-toggle"
                checked={gradientEnabled}
                onCheckedChange={setGradientEnabled}
              />
              <Label htmlFor="gradient-toggle" className="text-sm font-medium">
                Enable gradient backgrounds
              </Label>
            </div>

            {gradientEnabled && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Gradient Start Color</Label>
                    <div className="mt-2 space-y-3">
                      <div className="w-full max-w-[200px]">
                        <HexColorPicker 
                          color={gradientStartColor} 
                          onChange={setGradientStartColor}
                          style={{ width: '100%', height: '150px' }}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Input
                          value={gradientStartHex}
                          onChange={(e) => handleGradientStartHexChange(e.target.value)}
                          placeholder="#007acc"
                          className="font-mono text-sm"
                        />
                        <div 
                          className="w-8 h-8 rounded border border-border"
                          style={{ backgroundColor: gradientStartColor }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Gradient End Color</Label>
                    <div className="mt-2 space-y-3">
                      <div className="w-full max-w-[200px]">
                        <HexColorPicker 
                          color={gradientEndColor} 
                          onChange={setGradientEndColor}
                          style={{ width: '100%', height: '150px' }}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Input
                          value={gradientEndHex}
                          onChange={(e) => handleGradientEndHexChange(e.target.value)}
                          placeholder="#00b2a9"
                          className="font-mono text-sm"
                        />
                        <div 
                          className="w-8 h-8 rounded border border-border"
                          style={{ backgroundColor: gradientEndColor }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <Label className="text-sm font-medium">Gradient Preview</Label>
                  <div 
                    className="mt-2 w-full h-16 rounded-lg border border-border"
                    style={{ 
                      background: `linear-gradient(135deg, ${gradientStartColor} 0%, ${gradientEndColor} 100%)` 
                    }}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-start">
              <Button onClick={applyCustomTheme} className="px-6">
                Apply Custom Theme
              </Button>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="space-y-4">
          <h3 className="font-semibold">URL-based Theme Testing</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium">Subdomain examples:</p>
              <ul className="space-y-1 text-muted-foreground">
                 <li>losangeles.medme.com → Los Angeles theme</li>
                 <li>cvs.medme.com → CVS theme</li>
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