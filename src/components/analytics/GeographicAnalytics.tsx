import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { MapPin, TrendingUp, Users } from 'lucide-react';
import { useGeographicAnalytics } from '@/hooks/useAdvancedAnalytics';

interface GeographicAnalyticsProps {
  dateRange: string;
}

export const GeographicAnalytics: React.FC<GeographicAnalyticsProps> = ({ dateRange }) => {
  const { data: geoData, isLoading, error } = useGeographicAnalytics(dateRange);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Geographic Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !geoData?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Geographic Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No geographic data available</p>
        </CardContent>
      </Card>
    );
  }

  const totalSearches = geoData.reduce((sum, region) => sum + region.search_count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Geographic Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {geoData.slice(0, 8).map((region, index) => {
            const percentage = totalSearches > 0 ? (region.search_count / totalSearches) * 100 : 0;
            
            return (
              <div key={region.location} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-sm font-medium text-primary">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium">{region.location}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span>{region.search_count} searches</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {percentage.toFixed(1)}%
                  </Badge>
                  {region.conversion_rate > 0 && (
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-green-600" />
                      <span className="text-xs text-green-600">{region.conversion_rate}%</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {geoData.length > 8 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Showing top 8 of {geoData.length} locations
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};