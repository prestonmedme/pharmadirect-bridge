import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Building2, ArrowUpDown, Crown, TrendingUp } from 'lucide-react';
import { usePharmacyPerformance } from '@/hooks/useAnalyticsData';

interface PharmacyPerformanceProps {
  dateRange: string;
}

type SortField = 'impressions' | 'clicks' | 'bookings' | 'conversion';
type SortDirection = 'asc' | 'desc';

export const PharmacyPerformance: React.FC<PharmacyPerformanceProps> = ({ dateRange }) => {
  const { data: pharmacies, isLoading, error } = usePharmacyPerformance(dateRange);
  const [sortField, setSortField] = useState<SortField>('impressions');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedPharmacies = pharmacies ? [...pharmacies].sort((a, b) => {
    let valueA: number, valueB: number;
    
    switch (sortField) {
      case 'impressions':
        valueA = a.total_impressions;
        valueB = b.total_impressions;
        break;
      case 'clicks':
        valueA = a.total_clicks;
        valueB = b.total_clicks;
        break;
      case 'bookings':
        valueA = a.bookings;
        valueB = b.bookings;
        break;
      case 'conversion':
        valueA = a.conversion_rate;
        valueB = b.conversion_rate;
        break;
      default:
        return 0;
    }
    
    return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
  }) : [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-48" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !pharmacies?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Pharmacy Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No pharmacy performance data available</p>
        </CardContent>
      </Card>
    );
  }

  const topPerformer = sortedPharmacies[0];
  const medmePharmacies = sortedPharmacies.filter(p => p.is_medme);
  const avgConversion = sortedPharmacies.reduce((sum, p) => sum + p.conversion_rate, 0) / sortedPharmacies.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          Pharmacy Performance Metrics
          <Badge variant="secondary" className="ml-auto">
            {pharmacies.length} pharmacies
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Crown className="h-4 w-4" />
              Top Performer
            </div>
            <div className="font-semibold">{topPerformer?.pharmacy_name}</div>
            <div className="text-sm text-muted-foreground">
              {topPerformer?.total_impressions} impressions, {topPerformer?.conversion_rate}% conversion
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="text-sm text-muted-foreground mb-1">MedMe Pharmacies</div>
            <div className="font-semibold">{medmePharmacies.length}/{pharmacies.length}</div>
            <div className="text-sm text-muted-foreground">
              {Math.round((medmePharmacies.length / pharmacies.length) * 100)}% of top performers
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <TrendingUp className="h-4 w-4" />
              Avg Conversion
            </div>
            <div className="font-semibold">{Math.round(avgConversion * 10) / 10}%</div>
            <div className="text-sm text-muted-foreground">
              Platform average
            </div>
          </div>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pharmacy</TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSort('impressions')}
                    className="gap-1 h-auto p-0 font-medium"
                  >
                    Impressions
                    <ArrowUpDown className="h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSort('clicks')}
                    className="gap-1 h-auto p-0 font-medium"
                  >
                    Clicks
                    <ArrowUpDown className="h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSort('bookings')}
                    className="gap-1 h-auto p-0 font-medium"
                  >
                    Bookings
                    <ArrowUpDown className="h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSort('conversion')}
                    className="gap-1 h-auto p-0 font-medium"
                  >
                    Conversion
                    <ArrowUpDown className="h-3 w-3" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPharmacies.map((pharmacy, index) => (
                <TableRow key={pharmacy.pharmacy_id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{pharmacy.pharmacy_name}</span>
                      {pharmacy.is_medme && (
                        <Badge variant="default" className="text-xs">MedMe</Badge>
                      )}
                      {index < 3 && (
                        <Crown className="h-3 w-3 text-yellow-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {pharmacy.total_impressions.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {pharmacy.total_clicks.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {pharmacy.bookings.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={pharmacy.conversion_rate >= avgConversion ? "default" : "secondary"}
                      className="font-medium"
                    >
                      {pharmacy.conversion_rate}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};