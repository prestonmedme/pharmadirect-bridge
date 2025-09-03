import React, { useState, useEffect } from "react";
import { 
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose
} from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  X, 
  Star, 
  Phone, 
  Globe, 
  MapPin, 
  Clock, 
  Calendar,
  ExternalLink,
  Navigation,
  Loader2
} from "lucide-react";
import { PharmacyCard, PharmacyDetails } from "@/types/pharmacy";
import { getPlaceDetails } from "@/lib/pharmacyDataUtils";
import { AnalyticsService } from "@/lib/analytics";

interface PharmacyProfileDrawerProps {
  pharmacy: PharmacyCard | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookAppointment?: (pharmacy: PharmacyCard) => void;
}

export const PharmacyProfileDrawer: React.FC<PharmacyProfileDrawerProps> = ({
  pharmacy,
  open,
  onOpenChange,
  onBookAppointment
}) => {
  const [details, setDetails] = useState<PharmacyDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch detailed data when pharmacy changes
  useEffect(() => {
    if (!pharmacy || !open) {
      setDetails(null);
      setError(null);
      return;
    }

    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let fetchedDetails: PharmacyDetails = { ...pharmacy };

        if (pharmacy.source === 'google' && pharmacy.placeId) {
          // Fetch Google Places details
          const googleData = await getPlaceDetails(pharmacy.placeId);
          if (googleData) {
            fetchedDetails = {
              ...fetchedDetails,
              rating: {
                value: googleData.rating,
                count: googleData.user_ratings_total,
                source: 'google'
              },
              openingHours: googleData.opening_hours ? {
                isOpen: googleData.opening_hours.open_now || false,
                periods: googleData.opening_hours.periods,
                weekday_text: googleData.opening_hours.weekday_text
              } : undefined,
              userRatingsTotal: googleData.user_ratings_total
            };
          }
        } else if (pharmacy.source === 'medme' && pharmacy.medmeId) {
          // TODO: Fetch MedMe details from API
          // For now, simulate MedMe-specific data
          fetchedDetails = {
            ...fetchedDetails,
            services: ['Flu Shots', 'Travel Vaccines', 'Minor Ailments', 'MedsCheck'],
            availability: {
              nextSlots: ['2024-01-15T10:00:00Z', '2024-01-15T14:30:00Z', '2024-01-15T16:00:00Z']
            }
          };
        }

        setDetails(fetchedDetails);
      } catch (err) {
        console.error('Error fetching pharmacy details:', err);
        setError('Failed to load pharmacy details');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [pharmacy, open]);

  const handleGetDirections = () => {
    if (!pharmacy) return;
    // Track directions click
    AnalyticsService.trackPharmacyClick('directions', pharmacy.id, pharmacy.source === 'medme', 'profile_view');
    const destination = encodeURIComponent(`${pharmacy.address.line1}, ${pharmacy.address.city}`);
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    window.open(googleMapsUrl, '_blank');
  };

  const handleCallPharmacy = () => {
    if (pharmacy?.phone) {
      // Track call click from profile
      AnalyticsService.trackPharmacyClick('call', pharmacy.id, pharmacy.source === 'medme', 'profile_view');
      window.location.href = `tel:${pharmacy.phone}`;
    }
  };

  const handleVisitWebsite = () => {
    if (pharmacy?.website) {
      // Track website click
      AnalyticsService.trackPharmacyClick('website', pharmacy.id, pharmacy.source === 'medme', 'profile_view');
      window.open(pharmacy.website, '_blank');
    }
  };

  const handleViewOnGoogleMaps = () => {
    if (!pharmacy) return;
    const query = encodeURIComponent(`${pharmacy.name} ${pharmacy.address.line1}`);
    const googleMapsUrl = `https://www.google.com/maps/search/${query}`;
    window.open(googleMapsUrl, '_blank');
  };

  if (!pharmacy) return null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[90vh] max-w-2xl mx-auto">
        <DrawerHeader className="border-b">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <DrawerTitle className="text-xl font-semibold">{pharmacy.name}</DrawerTitle>
                <Badge variant="outline" className="text-xs">
                  {pharmacy.source === 'medme' ? 'MedMe Partner' : 'Google Listed'}
                </Badge>
              </div>
              
              <DrawerDescription className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {pharmacy.address.line1}, {pharmacy.address.city}
                </span>
                
                {pharmacy.rating?.value && (
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    {pharmacy.rating.value} ({pharmacy.rating.count} reviews)
                  </span>
                )}
                
                {pharmacy.openNow !== undefined && (
                  <Badge variant={pharmacy.openNow ? "default" : "secondary"} className="text-xs">
                    {pharmacy.openNow ? "Open" : "Closed"}
                  </Badge>
                )}
              </DrawerDescription>
            </div>
            
            <DrawerClose asChild>
              <Button variant="ghost" size="sm">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mt-4">
            {pharmacy.medmeConnected && (
              <Button onClick={() => onBookAppointment?.(pharmacy)} className="flex-1">
                <Calendar className="h-4 w-4 mr-2" />
                Book Now
              </Button>
            )}
            
            {pharmacy.phone && (
              <Button variant="outline" onClick={handleCallPharmacy}>
                <Phone className="h-4 w-4 mr-2" />
                Call
              </Button>
            )}
            
            {pharmacy.website && (
              <Button variant="outline" onClick={handleVisitWebsite}>
                <Globe className="h-4 w-4 mr-2" />
                Website
              </Button>
            )}
            
            {pharmacy.source === 'google' && (
              <Button variant="outline" onClick={handleViewOnGoogleMaps}>
                <ExternalLink className="h-4 w-4 mr-2" />
                View on Google
              </Button>
            )}

            <Button variant="outline" onClick={handleGetDirections}>
              <Navigation className="h-4 w-4 mr-2" />
              Directions
            </Button>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <p className="text-destructive">{error}</p>
              <Button variant="outline" onClick={() => window.location.reload()} className="mt-2">
                Retry
              </Button>
            </div>
          ) : (
            <Tabs defaultValue="overview" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-3 mx-6 mt-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
                {pharmacy.medmeConnected && (
                  <TabsTrigger value="availability">Availability</TabsTrigger>
                )}
              </TabsList>

              <div className="flex-1 overflow-y-auto p-6">
                <TabsContent value="overview" className="space-y-4 mt-0">
                  <OverviewTab pharmacy={pharmacy} details={details} />
                </TabsContent>

                <TabsContent value="services" className="space-y-4 mt-0">
                  <ServicesTab pharmacy={pharmacy} details={details} />
                </TabsContent>

                {pharmacy.medmeConnected && (
                  <TabsContent value="availability" className="space-y-4 mt-0">
                    <AvailabilityTab pharmacy={pharmacy} details={details} onBookAppointment={onBookAppointment} />
                  </TabsContent>
                )}
              </div>
            </Tabs>
          )}
        </div>

        {/* Google attribution */}
        {pharmacy.source === 'google' && pharmacy.placeAttributionHtml && (
          <div 
            className="px-6 py-2 text-xs text-muted-foreground border-t" 
            dangerouslySetInnerHTML={{ __html: pharmacy.placeAttributionHtml }}
          />
        )}
      </DrawerContent>
    </Drawer>
  );
};

// Overview Tab Component
const OverviewTab: React.FC<{ pharmacy: PharmacyCard; details: PharmacyDetails | null }> = ({ pharmacy, details }) => {
  return (
    <div className="space-y-4">
      {/* Address & Contact */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium mb-3">Contact Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <p>{pharmacy.address.line1}</p>
                <p>{pharmacy.address.city}, {pharmacy.address.state} {pharmacy.address.zipCode}</p>
              </div>
            </div>
            
            {pharmacy.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${pharmacy.phone}`} className="text-primary hover:underline">
                  {pharmacy.phone}
                </a>
              </div>
            )}
            
            {pharmacy.website && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <a href={pharmacy.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Visit Website
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Hours */}
      {details?.openingHours && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-3">Hours</h3>
            <div className="space-y-1 text-sm">
              {details.openingHours.weekday_text?.map((day, index) => (
                <div key={index} className="flex justify-between">
                  <span>{day.split(': ')[0]}</span>
                  <span className="text-muted-foreground">{day.split(': ')[1]}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attributes */}
      {pharmacy.attributes && pharmacy.attributes.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-3">Features</h3>
            <div className="flex flex-wrap gap-2">
              {pharmacy.attributes.map((attr) => (
                <Badge key={attr} variant="secondary" className="text-xs">
                  {attr}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Services Tab Component
const ServicesTab: React.FC<{ pharmacy: PharmacyCard; details: PharmacyDetails | null }> = ({ pharmacy, details }) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium mb-3">Available Services</h3>
          
          {details?.services && details.services.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {details.services.map((service) => (
                <div key={service} className="flex items-center gap-2 p-2 bg-secondary/50 rounded-lg">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-sm">{service}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Services information not available</p>
              {pharmacy.source === 'google' && (
                <p className="text-xs mt-1">Services may vary - please call to confirm</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Availability Tab Component
const AvailabilityTab: React.FC<{ 
  pharmacy: PharmacyCard; 
  details: PharmacyDetails | null;
  onBookAppointment?: (pharmacy: PharmacyCard) => void;
}> = ({ pharmacy, details, onBookAppointment }) => {
  const formatSlotTime = (isoString: string) => {
    const date = new Date(isoString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium mb-3">Next Available Appointments</h3>
          
          {details?.availability?.nextSlots && details.availability.nextSlots.length > 0 ? (
            <div className="space-y-2">
              {details.availability.nextSlots.slice(0, 5).map((slot, index) => {
                const { date, time } = formatSlotTime(slot);
                return (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-secondary/50 transition-colors">
                    <div>
                      <p className="font-medium">{date}</p>
                      <p className="text-sm text-muted-foreground">{time}</p>
                    </div>
                    <Button size="sm" onClick={() => onBookAppointment?.(pharmacy)}>
                      Book
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No available appointments</p>
              <p className="text-xs mt-1">Please call to schedule</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};