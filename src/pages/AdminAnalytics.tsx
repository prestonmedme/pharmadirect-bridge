import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Building2,
  ArrowLeft,
  Calendar,
  Download,
  MapPin,
  Clock,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { TopServicesChart } from '@/components/analytics/TopServicesChart';
import { MedMeClickRate } from '@/components/analytics/MedMeClickRate';
import { BookingFunnelChart } from '@/components/analytics/BookingFunnelChart';
import { PharmacyPerformance } from '@/components/analytics/PharmacyPerformance';
import { GeographicAnalytics } from '@/components/analytics/GeographicAnalytics';
import { TimeBasedAnalytics } from '@/components/analytics/TimeBasedAnalytics';
import { UserBehaviorAnalytics } from '@/components/analytics/UserBehaviorAnalytics';
import { ServiceDeepDive } from '@/components/analytics/ServiceDeepDive';

const AdminAnalytics = () => {
  const [dateRange, setDateRange] = useState('7d');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/admin">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Analytics Dashboard</h1>
                <p className="text-sm text-muted-foreground">Platform Performance & User Insights</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <select 
                  value={dateRange} 
                  onChange={(e) => setDateRange(e.target.value)}
                  className="text-sm border rounded px-2 py-1"
                >
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                </select>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="services" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Services
            </TabsTrigger>
            <TabsTrigger value="deep-dive" className="gap-2">
              <Activity className="h-4 w-4" />
              Deep Dive
            </TabsTrigger>
            <TabsTrigger value="geographic" className="gap-2">
              <MapPin className="h-4 w-4" />
              Geographic
            </TabsTrigger>
            <TabsTrigger value="time-based" className="gap-2">
              <Clock className="h-4 w-4" />
              Time-based
            </TabsTrigger>
            <TabsTrigger value="behavior" className="gap-2">
              <Users className="h-4 w-4" />
              Behavior
            </TabsTrigger>
            <TabsTrigger value="pharmacies" className="gap-2">
              <Building2 className="h-4 w-4" />
              Pharmacies
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <MedMeClickRate dateRange={dateRange} />
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Key Metrics Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Searches</span>
                      <Badge variant="secondary">1,234</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Pharmacy Views</span>
                      <Badge variant="secondary">856</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Bookings</span>
                      <Badge variant="secondary">127</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Conversion Rate</span>
                      <Badge variant="default">10.3%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <TopServicesChart dateRange={dateRange} compact />
              <BookingFunnelChart dateRange={dateRange} compact />
            </div>
          </TabsContent>

          <TabsContent value="services">
            <TopServicesChart dateRange={dateRange} />
          </TabsContent>

          <TabsContent value="deep-dive">
            <ServiceDeepDive dateRange={dateRange} />
          </TabsContent>

          <TabsContent value="geographic">
            <GeographicAnalytics dateRange={dateRange} />
          </TabsContent>

          <TabsContent value="time-based">
            <TimeBasedAnalytics dateRange={dateRange} />
          </TabsContent>

          <TabsContent value="behavior">
            <UserBehaviorAnalytics dateRange={dateRange} />
          </TabsContent>

          <TabsContent value="pharmacies">
            <PharmacyPerformance dateRange={dateRange} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminAnalytics;