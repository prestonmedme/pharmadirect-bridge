import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Minus, Target } from 'lucide-react';
import { useMedMeMetrics } from '@/hooks/useAnalyticsData';

interface MedMeClickRateProps {
  dateRange: string;
}

export const MedMeClickRate: React.FC<MedMeClickRateProps> = ({ dateRange }) => {
  const { data: metrics, isLoading, error } = useMedMeMetrics(dateRange);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-40" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-8 w-20" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            MedMe Click Percentage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No impression data available</p>
        </CardContent>
      </Card>
    );
  }

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return "text-green-600";
    if (trend < 0) return "text-red-600";
    return "text-muted-foreground";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          MedMe Click Percentage
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl font-bold text-primary">
              {metrics.click_percentage}%
            </div>
            <div className={`flex items-center gap-1 text-sm ${getTrendColor(metrics.trend)}`}>
              {getTrendIcon(metrics.trend)}
              <span>
                {metrics.trend > 0 ? '+' : ''}{metrics.trend}%
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Impressions</span>
              <Badge variant="outline">{metrics.total_impressions.toLocaleString()}</Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">MedMe Impressions</span>
              <Badge variant="default">{metrics.medme_impressions.toLocaleString()}</Badge>
            </div>

            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${metrics.click_percentage}%` }}
              />
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            {metrics.click_percentage >= 50 ? (
              <span className="text-green-600">✓ Strong MedMe preference</span>
            ) : metrics.click_percentage >= 25 ? (
              <span className="text-yellow-600">⚠ Moderate MedMe preference</span>
            ) : (
              <span className="text-red-600">↓ Low MedMe preference</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};