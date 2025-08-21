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
import { FunnelChart, Funnel, Cell, ResponsiveContainer } from 'recharts';
import { Users, TrendingDown } from 'lucide-react';
import { useBookingFunnel } from '@/hooks/useAnalyticsData';

interface BookingFunnelChartProps {
  dateRange: string;
  compact?: boolean;
}

const chartConfig = {
  count: {
    label: "Users",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

const FUNNEL_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--primary-light))',
  'hsl(217 91% 55%)',
  'hsl(217 91% 65%)',
  'hsl(217 91% 75%)'
];

export const BookingFunnelChart: React.FC<BookingFunnelChartProps> = ({ 
  dateRange, 
  compact = false 
}) => {
  const { data: funnel, isLoading, error } = useBookingFunnel(dateRange);

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
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !funnel?.length) {
    return (
      <Card className={compact ? "h-80" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Booking Conversion Funnel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No funnel data available</p>
        </CardContent>
      </Card>
    );
  }

  const conversionRate = funnel[0]?.count > 0 
    ? Math.round((funnel[funnel.length - 1]?.count / funnel[0]?.count) * 100 * 10) / 10 
    : 0;

  return (
    <Card className={compact ? "h-80" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Booking Conversion Funnel
          {!compact && (
            <Badge variant="secondary" className="ml-auto">
              {conversionRate}% conversion
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {compact ? (
          <div className="space-y-3">
            {funnel.map((step, index) => {
              const dropoff = index > 0 
                ? Math.round(((funnel[index - 1].count - step.count) / funnel[index - 1].count) * 100)
                : 0;
              
              return (
                <div key={step.step} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{step.step}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{step.count}</span>
                      <Badge variant="outline" className="text-xs">
                        {step.percentage}%
                      </Badge>
                    </div>
                  </div>
                  {dropoff > 0 && (
                    <div className="text-xs text-red-600 flex items-center gap-1">
                      <TrendingDown className="h-3 w-3" />
                      {dropoff}% drop-off
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <>
            <ChartContainer config={chartConfig} className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <FunnelChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <Funnel
                    dataKey="count"
                    data={funnel}
                    isAnimationActive
                  >
                    {funnel.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={FUNNEL_COLORS[index]} />
                    ))}
                  </Funnel>
                  <ChartTooltip 
                    content={
                      <ChartTooltipContent 
                        formatter={(value, name, props) => [
                          `${value} users (${props.payload?.percentage}%)`,
                          props.payload?.step
                        ]}
                        labelFormatter={() => ""}
                      />
                    }
                  />
                </FunnelChart>
              </ResponsiveContainer>
            </ChartContainer>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-sm text-muted-foreground">Overall Conversion</div>
                <div className="text-xl font-bold text-primary">{conversionRate}%</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-sm text-muted-foreground">Biggest Drop-off</div>
                <div className="text-xl font-bold text-red-600">
                  {funnel[0]?.count > funnel[1]?.count 
                    ? `${Math.round(((funnel[0].count - funnel[1].count) / funnel[0].count) * 100)}%`
                    : '0%'
                  }
                </div>
                <div className="text-xs text-muted-foreground">
                  Search → Results
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};