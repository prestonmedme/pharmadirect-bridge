import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BrandConfiguration } from '@/hooks/useBrandConfigurations';
import { Eye, Edit, Trash2, CheckCircle } from 'lucide-react';

interface BrandConfigurationCardProps {
  config: BrandConfiguration;
  onEdit: (config: BrandConfiguration) => void;
  onDelete: (id: string) => void;
  onActivate: (id: string) => void;
  onPreview: (config: BrandConfiguration) => void;
}

export function BrandConfigurationCard({ 
  config, 
  onEdit, 
  onDelete, 
  onActivate, 
  onPreview 
}: BrandConfigurationCardProps) {
  return (
    <Card className="relative group hover:shadow-md transition-shadow">
      {config.is_active && (
        <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">
          Active
        </Badge>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg">{config.name}</h3>
            {config.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {config.description}
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Brand Preview */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded border"
              style={{ backgroundColor: config.primary_color }}
            />
            <span className="text-xs text-muted-foreground">
              Primary: {config.primary_color}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded border"
              style={{ backgroundColor: config.secondary_color }}
            />
            <span className="text-xs text-muted-foreground">
              Secondary: {config.secondary_color}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            Font: {config.font_family.split(',')[0]}
          </div>
          <div className="text-xs text-muted-foreground">
            Style: {config.cta_style}
          </div>
        </div>

        {/* Domain Mappings */}
        {config.domain_mapping && config.domain_mapping.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Domains:</p>
            <div className="flex flex-wrap gap-1">
              {config.domain_mapping.slice(0, 2).map((domain, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {domain}
                </Badge>
              ))}
              {config.domain_mapping.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{config.domain_mapping.length - 2} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPreview(config)}
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-1" />
            Preview
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(config)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          {!config.is_active && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onActivate(config.id)}
            >
              <CheckCircle className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(config.id)}
            disabled={config.is_active}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}