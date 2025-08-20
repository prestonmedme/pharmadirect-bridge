import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useBrandConfigurations, BrandConfiguration, BrandTemplate } from '@/hooks/useBrandConfigurations';
import { BrandConfigurationCard } from '@/components/admin/brand/BrandConfigurationCard';
import { BrandTemplateCard } from '@/components/admin/brand/BrandTemplateCard';
import { BrandConfigurationForm } from '@/components/admin/brand/BrandConfigurationForm';
import { Plus, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export default function AdminBrandManagement() {
  const { 
    configurations, 
    templates, 
    loading, 
    createConfiguration, 
    updateConfiguration, 
    deleteConfiguration, 
    activateConfiguration,
    createFromTemplate 
  } = useBrandConfigurations();
  
  const { toast } = useToast();
  const [selectedConfig, setSelectedConfig] = useState<BrandConfiguration | undefined>();
  const [showConfigForm, setShowConfigForm] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<BrandTemplate | undefined>();
  const [templateFormData, setTemplateFormData] = useState({ name: '', description: '' });

  const handleCreateConfiguration = async (config: Omit<BrandConfiguration, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await createConfiguration(config);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleUpdateConfiguration = async (config: Omit<BrandConfiguration, 'id' | 'created_at' | 'updated_at'>) => {
    if (!selectedConfig) return;
    try {
      await updateConfiguration(selectedConfig.id, config);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleDeleteConfiguration = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this brand configuration?')) {
      try {
        await deleteConfiguration(id);
      } catch (error) {
        // Error is handled in the hook
      }
    }
  };

  const handleActivateConfiguration = async (id: string) => {
    try {
      await activateConfiguration(id);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleEditConfiguration = (config: BrandConfiguration) => {
    setSelectedConfig(config);
    setShowConfigForm(true);
  };

  const handlePreviewConfiguration = (config: BrandConfiguration) => {
    // TODO: Implement preview functionality
    toast({
      title: "Preview",
      description: "Preview functionality coming soon!",
    });
  };

  const handleUseTemplate = (template: BrandTemplate) => {
    setSelectedTemplate(template);
    setTemplateFormData({ name: `${template.name} Configuration`, description: '' });
    setShowTemplateDialog(true);
  };

  const handleCreateFromTemplate = async () => {
    if (!selectedTemplate) return;
    
    try {
      await createFromTemplate(selectedTemplate.id, templateFormData.name, templateFormData.description);
      setShowTemplateDialog(false);
      setTemplateFormData({ name: '', description: '' });
    } catch (error) {
      // Error is handled in the hook
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading brand configurations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/admin">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Brand Management</h1>
            <p className="text-muted-foreground">
              Manage brand configurations, themes, and templates for your platform.
            </p>
          </div>
        </div>

        <Tabs defaultValue="configurations" className="space-y-6">
          <TabsList>
            <TabsTrigger value="configurations">Brand Configurations</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="configurations" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Brand Configurations</h2>
              <Button onClick={() => {
                setSelectedConfig(undefined);
                setShowConfigForm(true);
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Create Configuration
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {configurations.map((config) => (
                <BrandConfigurationCard
                  key={config.id}
                  config={config}
                  onEdit={handleEditConfiguration}
                  onDelete={handleDeleteConfiguration}
                  onActivate={handleActivateConfiguration}
                  onPreview={handlePreviewConfiguration}
                />
              ))}
            </div>

            {configurations.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No brand configurations found.</p>
                  <Button 
                    className="mt-4"
                    onClick={() => {
                      setSelectedConfig(undefined);
                      setShowConfigForm(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Configuration
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Brand Templates</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <BrandTemplateCard
                  key={template.id}
                  template={template}
                  onUse={handleUseTemplate}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Configuration Form Dialog */}
        <BrandConfigurationForm
          open={showConfigForm}
          onClose={() => {
            setShowConfigForm(false);
            setSelectedConfig(undefined);
          }}
          config={selectedConfig}
          onSave={selectedConfig ? handleUpdateConfiguration : handleCreateConfiguration}
        />

        {/* Template Creation Dialog */}
        <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Configuration from Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="template-name">Configuration Name</Label>
                <Input
                  id="template-name"
                  value={templateFormData.name}
                  onChange={(e) => setTemplateFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter configuration name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-description">Description (Optional)</Label>
                <Textarea
                  id="template-description"
                  value={templateFormData.description}
                  onChange={(e) => setTemplateFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter description"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateFromTemplate} disabled={!templateFormData.name.trim()}>
                  Create Configuration
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}