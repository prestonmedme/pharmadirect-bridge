import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity, TrendingUp, TrendingDown, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useServiceDeepDive } from '@/hooks/useAdvancedAnalytics';

interface ServiceDeepDiveProps {
  dateRange: string;
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(217, 91%, 45%)',
  'hsl(217, 91%, 60%)',
  'hsl(217, 50%, 70%)',
];

export const ServiceDeepDive: React.FC<ServiceDeepDiveProps> = ({ dateRange }) => {
  const { data: serviceData, isLoading, error } = useServiceDeepDive(dateRange);

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Service Conversion Rates</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Service Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !serviceData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Service Deep Dive
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No service data available</p>
        </CardContent>
      </Card>
    );
  }

  const totalSearches = serviceData.services?.reduce((sum, service) => sum + service.searches, 0) || 0;
  const totalConversions = serviceData.services?.reduce((sum, service) => sum + service.conversions, 0) || 0;
  const overallConversionRate = totalSearches > 0 ? (totalConversions / totalSearches) * 100 : 0;

  return (
    <div className="grid gap-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Searches</span>
            </div>
            <p className="text-2xl font-bold">{totalSearches.toLocaleString()}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm text-muted-foreground">Conversions</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{totalConversions}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Conversion Rate</span>
            </div>
            <p className="text-2xl font-bold text-primary">{overallConversionRate.toFixed(1)}%</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Active Services</span>
            </div>
            <p className="text-2xl font-bold">{serviceData.services?.length || 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Service Conversion Rates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Service Conversion Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {serviceData.services && serviceData.services.length > 0 ? (
              <div className="space-y-4">
                {serviceData.services.slice(0, 8).map((service, index) => {
                  const conversionRate = service.searches > 0 ? (service.conversions / service.searches) * 100 : 0;
                  const isAboveAverage = conversionRate > overallConversionRate;
                  
                  return (
                    <div key={service.service_type} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{service.service_type}</span>
                          {isAboveAverage ? (
                            <TrendingUp className="h-3 w-3 text-green-600" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-red-600" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={isAboveAverage ? "default" : "secondary"} className="text-xs">
                            {conversionRate.toFixed(1)}%
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {service.conversions}/{service.searches}
                          </span>
                        </div>
                      </div>
                      <Progress value={conversionRate} className="h-2" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground">No service conversion data available</p>
            )}
          </CardContent>
        </Card>

        {/* Service Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Service Search Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {serviceData.services && serviceData.services.length > 0 ? (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={serviceData.services.slice(0, 5)}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="searches"
                      nameKey="service_type"
                    >
                      {serviceData.services.slice(0, 5).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [value, 'Searches']}
                      labelFormatter={(label) => `Service: ${label}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="grid grid-cols-2 gap-2">
                  {serviceData.services.slice(0, 5).map((service, index) => (
                    <div key={service.service_type} className="flex items-center gap-2">
                      <div 
                        className="h-3 w-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-xs text-muted-foreground truncate">
                        {service.service_type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No service distribution data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Trending Services */}
      {serviceData.trending && serviceData.trending.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Trending Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {serviceData.trending.slice(0, 6).map((trend, index) => (
                <div key={trend.service_type} className="p-3 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{trend.service_type}</span>
                    <Badge variant={trend.growth > 0 ? "default" : "secondary"} className="text-xs">
                      {trend.growth > 0 ? '+' : ''}{trend.growth.toFixed(1)}%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {trend.current_searches} searches this period
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};