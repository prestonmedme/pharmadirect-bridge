import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface BrandConfiguration {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  favicon_url?: string;
  primary_color: string;
  secondary_color: string;
  font_family: string;
  cta_style: 'rounded' | 'pill' | 'block';
  gradient_enabled: boolean;
  gradient_start_color?: string;
  gradient_end_color?: string;
  custom_css?: string;
  is_active: boolean;
  domain_mapping?: string[];
  subdomain_mapping?: string[];
  created_at: string;
  updated_at: string;
}

export interface BrandTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  font_family: string;
  cta_style: 'rounded' | 'pill' | 'block';
  gradient_enabled: boolean;
  gradient_start_color?: string;
  gradient_end_color?: string;
  preview_image_url?: string;
  is_public: boolean;
}

export function useBrandConfigurations() {
  const [configurations, setConfigurations] = useState<BrandConfiguration[]>([]);
  const [templates, setTemplates] = useState<BrandTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchConfigurations = async () => {
    try {
      const { data, error } = await supabase
        .from('brand_configurations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConfigurations((data || []) as BrandConfiguration[]);
    } catch (error) {
      console.error('Error fetching brand configurations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch brand configurations",
        variant: "destructive",
      });
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('brand_templates')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      setTemplates((data || []) as BrandTemplate[]);
    } catch (error) {
      console.error('Error fetching brand templates:', error);
      toast({
        title: "Error",
        description: "Failed to fetch brand templates",
        variant: "destructive",
      });
    }
  };

  const createConfiguration = async (config: Omit<BrandConfiguration, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('brand_configurations')
        .insert([config])
        .select()
        .single();

      if (error) throw error;
      
      await fetchConfigurations();
      toast({
        title: "Success",
        description: "Brand configuration created successfully",
      });
      
      return data;
    } catch (error) {
      console.error('Error creating brand configuration:', error);
      toast({
        title: "Error",
        description: "Failed to create brand configuration",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateConfiguration = async (id: string, updates: Partial<BrandConfiguration>) => {
    try {
      const { data, error } = await supabase
        .from('brand_configurations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      await fetchConfigurations();
      toast({
        title: "Success",
        description: "Brand configuration updated successfully",
      });
      
      return data;
    } catch (error) {
      console.error('Error updating brand configuration:', error);
      toast({
        title: "Error",
        description: "Failed to update brand configuration",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteConfiguration = async (id: string) => {
    try {
      const { error } = await supabase
        .from('brand_configurations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchConfigurations();
      toast({
        title: "Success",
        description: "Brand configuration deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting brand configuration:', error);
      toast({
        title: "Error",
        description: "Failed to delete brand configuration",
        variant: "destructive",
      });
      throw error;
    }
  };

  const activateConfiguration = async (id: string) => {
    try {
      // First deactivate all configurations
      await supabase
        .from('brand_configurations')
        .update({ is_active: false });

      // Then activate the selected one
      const { error } = await supabase
        .from('brand_configurations')
        .update({ is_active: true })
        .eq('id', id);

      if (error) throw error;
      
      await fetchConfigurations();
      toast({
        title: "Success",
        description: "Brand configuration activated successfully",
      });
    } catch (error) {
      console.error('Error activating brand configuration:', error);
      toast({
        title: "Error",
        description: "Failed to activate brand configuration",
        variant: "destructive",
      });
      throw error;
    }
  };

  const createFromTemplate = async (templateId: string, name: string, description?: string) => {
    try {
      const template = templates.find(t => t.id === templateId);
      if (!template) throw new Error('Template not found');

      const config = {
        name,
        description,
        logo_url: template.logo_url,
        primary_color: template.primary_color,
        secondary_color: template.secondary_color,
        font_family: template.font_family,
        cta_style: template.cta_style,
        gradient_enabled: template.gradient_enabled,
        gradient_start_color: template.gradient_start_color,
        gradient_end_color: template.gradient_end_color,
        is_active: false,
      };

      return await createConfiguration(config);
    } catch (error) {
      console.error('Error creating configuration from template:', error);
      toast({
        title: "Error",
        description: "Failed to create configuration from template",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchConfigurations(), fetchTemplates()]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    configurations,
    templates,
    loading,
    createConfiguration,
    updateConfiguration,
    deleteConfiguration,
    activateConfiguration,
    createFromTemplate,
    refetch: () => Promise.all([fetchConfigurations(), fetchTemplates()]),
  };
}