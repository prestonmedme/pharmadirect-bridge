import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Search, TrendingUp } from 'lucide-react';
import { useTopServices } from '@/hooks/useAnalyticsData';

interface TopServicesChartProps {
  dateRange: string;
  compact?: boolean;
}

const chartConfig = {
  search_count: {
    label: "Searches",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export const TopServicesChart: React.FC<TopServicesChartProps> = ({ 
  dateRange, 
  compact = false 
}) => {
  const { data: services, isLoading, error } = useTopServices(dateRange);

  if (isLoading) {
    return (
      <Card className={compact ? "h-80" : ""}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !services?.length) {
    return (
      <Card className={compact ? "h-80" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Top Services Searched
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No search data available</p>
        </CardContent>
      </Card>
    );
  }

  const displayData = compact ? services.slice(0, 5) : services;

  return (
    <Card className={compact ? "h-80" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5 text-primary" />
          Top Services Searched
          {!compact && (
            <Badge variant="secondary" className="ml-auto">
              {services.length} services
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {compact ? (
          <div className="space-y-3">
            {displayData.map((service, index) => (
              <div key={service.service_type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    #{index + 1}
                  </span>
                  <span className="text-sm font-medium capitalize">
                    {service.service_type.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">{service.search_count}</span>
                  <Badge variant="outline" className="text-xs">
                    {service.percentage}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={displayData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis 
                  dataKey="service_type" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => value.replace('_', ' ')}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <ChartTooltip 
                  content={
                    <ChartTooltipContent 
                      formatter={(value, name) => [
                        `${value} searches (${displayData.find(d => d.search_count === value)?.percentage}%)`,
                        'Searches'
                      ]}
                      labelFormatter={(label) => label.replace('_', ' ')}
                    />
                  }
                />
                <Bar 
                  dataKey="search_count" 
                  fill="var(--color-search_count)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
        
        {!compact && (
          <div className="mt-4 p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>
                Top service: <strong className="text-foreground capitalize">
                  {services[0]?.service_type.replace('_', ' ')}
                </strong> with {services[0]?.search_count} searches ({services[0]?.percentage}%)
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};