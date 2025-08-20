import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BrandTemplate } from '@/hooks/useBrandConfigurations';
import { Plus } from 'lucide-react';

interface BrandTemplateCardProps {
  template: BrandTemplate;
  onUse: (template: BrandTemplate) => void;
}

export function BrandTemplateCard({ template, onUse }: BrandTemplateCardProps) {
  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold">{template.name}</h3>
            {template.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {template.description}
              </p>
            )}
          </div>
          <Badge variant="secondary" className="text-xs">
            {template.category}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Color Preview */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded border"
              style={{ backgroundColor: template.primary_color }}
            />
            <span className="text-xs text-muted-foreground">
              Primary: {template.primary_color}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded border"
              style={{ backgroundColor: template.secondary_color }}
            />
            <span className="text-xs text-muted-foreground">
              Secondary: {template.secondary_color}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            Font: {template.font_family.split(',')[0]}
          </div>
          <div className="text-xs text-muted-foreground">
            Style: {template.cta_style}
          </div>
        </div>

        {/* Gradient Preview */}
        {template.gradient_enabled && template.gradient_start_color && template.gradient_end_color && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Gradient:</p>
            <div 
              className="h-6 rounded border"
              style={{
                background: `linear-gradient(135deg, ${template.gradient_start_color}, ${template.gradient_end_color})`
              }}
            />
          </div>
        )}

        <Button
          onClick={() => onUse(template)}
          className="w-full"
          variant="outline"
        >
          <Plus className="w-4 h-4 mr-2" />
          Use Template
        </Button>
      </CardContent>
    </Card>
  );
}