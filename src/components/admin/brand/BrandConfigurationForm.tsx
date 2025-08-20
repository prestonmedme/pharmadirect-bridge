import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { BrandConfiguration } from '@/hooks/useBrandConfigurations';
import { HexColorPicker } from 'react-colorful';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BrandConfigurationFormProps {
  open: boolean;
  onClose: () => void;
  config?: BrandConfiguration;
  onSave: (config: Omit<BrandConfiguration, 'id' | 'created_at' | 'updated_at'>) => void;
}

export function BrandConfigurationForm({ open, onClose, config, onSave }: BrandConfigurationFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logo_url: '',
    favicon_url: '',
    primary_color: '#007acc',
    secondary_color: '#00b2a9',
    font_family: 'Inter, sans-serif',
    cta_style: 'rounded' as 'rounded' | 'pill' | 'block',
    gradient_enabled: true,
    gradient_start_color: '#007acc',
    gradient_end_color: '#00b2a9',
    custom_css: '',
    is_active: false,
    domain_mapping: [] as string[],
    subdomain_mapping: [] as string[],
  });

  const [domainInput, setDomainInput] = useState('');
  const [subdomainInput, setSubdomainInput] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    if (config) {
      setFormData({
        name: config.name,
        description: config.description || '',
        logo_url: config.logo_url || '',
        favicon_url: config.favicon_url || '',
        primary_color: config.primary_color,
        secondary_color: config.secondary_color,
        font_family: config.font_family,
        cta_style: config.cta_style,
        gradient_enabled: config.gradient_enabled,
        gradient_start_color: config.gradient_start_color || config.primary_color,
        gradient_end_color: config.gradient_end_color || config.secondary_color,
        custom_css: config.custom_css || '',
        is_active: config.is_active,
        domain_mapping: config.domain_mapping || [],
        subdomain_mapping: config.subdomain_mapping || [],
      });
    } else {
      // Reset form for new configuration
      setFormData({
        name: '',
        description: '',
        logo_url: '',
        favicon_url: '',
        primary_color: '#007acc',
        secondary_color: '#00b2a9',
        font_family: 'Inter, sans-serif',
        cta_style: 'rounded',
        gradient_enabled: true,
        gradient_start_color: '#007acc',
        gradient_end_color: '#00b2a9',
        custom_css: '',
        is_active: false,
        domain_mapping: [],
        subdomain_mapping: [],
      });
    }
  }, [config, open]);

  const handleLogoUpload = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `brand-logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, logo_url: data.publicUrl }));
      toast({
        title: "Success",
        description: "Logo uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Error",
        description: "Failed to upload logo",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const addDomain = () => {
    if (domainInput.trim() && !formData.domain_mapping.includes(domainInput.trim())) {
      setFormData(prev => ({
        ...prev,
        domain_mapping: [...prev.domain_mapping, domainInput.trim()]
      }));
      setDomainInput('');
    }
  };

  const removeDomain = (domain: string) => {
    setFormData(prev => ({
      ...prev,
      domain_mapping: prev.domain_mapping.filter(d => d !== domain)
    }));
  };

  const addSubdomain = () => {
    if (subdomainInput.trim() && !formData.subdomain_mapping.includes(subdomainInput.trim())) {
      setFormData(prev => ({
        ...prev,
        subdomain_mapping: [...prev.subdomain_mapping, subdomainInput.trim()]
      }));
      setSubdomainInput('');
    }
  };

  const removeSubdomain = (subdomain: string) => {
    setFormData(prev => ({
      ...prev,
      subdomain_mapping: prev.subdomain_mapping.filter(s => s !== subdomain)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {config ? 'Edit Brand Configuration' : 'Create Brand Configuration'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="colors">Colors</TabsTrigger>
              <TabsTrigger value="branding">Branding</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cta_style">Button Style</Label>
                  <Select
                    value={formData.cta_style}
                    onValueChange={(value: 'rounded' | 'pill' | 'block') => 
                      setFormData(prev => ({ ...prev, cta_style: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rounded">Rounded</SelectItem>
                      <SelectItem value="pill">Pill</SelectItem>
                      <SelectItem value="block">Block</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="font_family">Font Family</Label>
                <Select
                  value={formData.font_family}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, font_family: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter, sans-serif">Inter</SelectItem>
                    <SelectItem value="Roboto, sans-serif">Roboto</SelectItem>
                    <SelectItem value="Lato, sans-serif">Lato</SelectItem>
                    <SelectItem value="Poppins, sans-serif">Poppins</SelectItem>
                    <SelectItem value="Open Sans, sans-serif">Open Sans</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="colors" className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <HexColorPicker
                    color={formData.primary_color}
                    onChange={(color) => setFormData(prev => ({ ...prev, primary_color: color }))}
                  />
                  <Input
                    value={formData.primary_color}
                    onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Secondary Color</Label>
                  <HexColorPicker
                    color={formData.secondary_color}
                    onChange={(color) => setFormData(prev => ({ ...prev, secondary_color: color }))}
                  />
                  <Input
                    value={formData.secondary_color}
                    onChange={(e) => setFormData(prev => ({ ...prev, secondary_color: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.gradient_enabled}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, gradient_enabled: checked }))}
                  />
                  <Label>Enable Gradients</Label>
                </div>

                {formData.gradient_enabled && (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Gradient Start Color</Label>
                      <HexColorPicker
                        color={formData.gradient_start_color}
                        onChange={(color) => setFormData(prev => ({ ...prev, gradient_start_color: color }))}
                      />
                      <Input
                        value={formData.gradient_start_color}
                        onChange={(e) => setFormData(prev => ({ ...prev, gradient_start_color: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Gradient End Color</Label>
                      <HexColorPicker
                        color={formData.gradient_end_color}
                        onChange={(color) => setFormData(prev => ({ ...prev, gradient_end_color: color }))}
                      />
                      <Input
                        value={formData.gradient_end_color}
                        onChange={(e) => setFormData(prev => ({ ...prev, gradient_end_color: e.target.value }))}
                      />
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="branding" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Logo Upload</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setLogoFile(file);
                          handleLogoUpload(file);
                        }
                      }}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label htmlFor="logo-upload" className="cursor-pointer">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload logo or drag and drop
                      </p>
                    </label>
                  </div>
                  {formData.logo_url && (
                    <div className="mt-2">
                      <img src={formData.logo_url} alt="Logo preview" className="h-16 object-contain" />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo_url">Logo URL (Alternative)</Label>
                  <Input
                    id="logo_url"
                    value={formData.logo_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, logo_url: e.target.value }))}
                    placeholder="https://example.com/logo.png"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="favicon_url">Favicon URL</Label>
                  <Input
                    id="favicon_url"
                    value={formData.favicon_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, favicon_url: e.target.value }))}
                    placeholder="https://example.com/favicon.ico"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Domain Mapping</Label>
                  <div className="flex gap-2">
                    <Input
                      value={domainInput}
                      onChange={(e) => setDomainInput(e.target.value)}
                      placeholder="example.com"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDomain())}
                    />
                    <Button type="button" onClick={addDomain}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.domain_mapping.map((domain, index) => (
                      <div key={index} className="flex items-center gap-1 bg-secondary px-2 py-1 rounded">
                        <span className="text-sm">{domain}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDomain(domain)}
                          className="h-4 w-4 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Subdomain Mapping</Label>
                  <div className="flex gap-2">
                    <Input
                      value={subdomainInput}
                      onChange={(e) => setSubdomainInput(e.target.value)}
                      placeholder="subdomain"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubdomain())}
                    />
                    <Button type="button" onClick={addSubdomain}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.subdomain_mapping.map((subdomain, index) => (
                      <div key={index} className="flex items-center gap-1 bg-secondary px-2 py-1 rounded">
                        <span className="text-sm">{subdomain}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSubdomain(subdomain)}
                          className="h-4 w-4 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custom_css">Custom CSS</Label>
                  <Textarea
                    id="custom_css"
                    value={formData.custom_css}
                    onChange={(e) => setFormData(prev => ({ ...prev, custom_css: e.target.value }))}
                    rows={6}
                    placeholder="/* Custom CSS styles */&#10;.custom-class {&#10;  /* your styles */&#10;}"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {config ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}