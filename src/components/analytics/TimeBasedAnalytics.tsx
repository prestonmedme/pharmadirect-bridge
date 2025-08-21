import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTimeBasedAnalytics } from '@/hooks/useAdvancedAnalytics';

interface TimeBasedAnalyticsProps {
  dateRange: string;
}

export const TimeBasedAnalytics: React.FC<TimeBasedAnalyticsProps> = ({ dateRange }) => {
  const { data: timeData, isLoading, error } = useTimeBasedAnalytics(dateRange);

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Peak Usage Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Daily Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !timeData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Time-Based Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No time data available</p>
        </CardContent>
      </Card>
    );
  }

  const peakHour = timeData.hourly_data?.reduce((peak, current) => 
    current.activity > peak.activity ? current : peak
  );

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Peak Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Peak Usage Hours
          </CardTitle>
        </CardHeader>
        <CardContent>
          {timeData.hourly_data && timeData.hourly_data.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg bg-primary/5">
                  <p className="text-sm text-muted-foreground">Peak Hour</p>
                  <p className="text-2xl font-bold text-primary">{peakHour?.hour}:00</p>
                  <p className="text-xs text-muted-foreground">{peakHour?.activity} searches</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-secondary/50">
                  <p className="text-sm text-muted-foreground">Avg/Hour</p>
                  <p className="text-2xl font-bold">
                    {Math.round(timeData.hourly_data.reduce((sum, h) => sum + h.activity, 0) / 24)}
                  </p>
                  <p className="text-xs text-muted-foreground">searches</p>
                </div>
              </div>
              
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={timeData.hourly_data}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="hour" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip 
                    labelFormatter={(hour) => `${hour}:00`}
                    formatter={(value) => [value, 'Searches']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="activity" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-muted-foreground">No hourly data available</p>
          )}
        </CardContent>
      </Card>

      {/* Daily Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Daily Activity Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          {timeData.daily_data && timeData.daily_data.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-950">
                  <p className="text-sm text-muted-foreground">Growth Rate</p>
                  <div className="flex items-center justify-center gap-1">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-xl font-bold text-green-600">
                      +{timeData.growth_rate?.toFixed(1) || 0}%
                    </span>
                  </div>
                </div>
                <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950">
                  <p className="text-sm text-muted-foreground">Total Activity</p>
                  <p className="text-xl font-bold text-blue-600">
                    {timeData.daily_data.reduce((sum, d) => sum + d.activity, 0)}
                  </p>
                </div>
              </div>
              
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={timeData.daily_data}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="date" 
                    fontSize={12}
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis fontSize={12} />
                  <Tooltip 
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    formatter={(value) => [value, 'Activity']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="activity" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-muted-foreground">No daily data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};