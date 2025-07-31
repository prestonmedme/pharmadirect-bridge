import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Navigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Phone, MapPin, Globe, Bell, Calendar, Edit2 } from 'lucide-react';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phoneNumber: z.string().optional(),
  preferredPharmacy: z.string().optional(),
  languagePreference: z.string(),
  notificationsEnabled: z.boolean(),
});

type ProfileForm = z.infer<typeof profileSchema>;

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useProfile();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
      preferredPharmacy: '',
      languagePreference: 'en',
      notificationsEnabled: true,
    },
  });

  // Update form values when user and profile data loads
  useEffect(() => {
    if (user && profile) {
      form.reset({
        fullName: user.user_metadata?.full_name || '',
        email: user.email || '',
        phoneNumber: profile.phone_number || '',
        preferredPharmacy: profile.preferred_pharmacy_id || 'none',
        languagePreference: profile.language_preference,
        notificationsEnabled: profile.notifications_enabled,
      });
    } else if (user && !profileLoading && !profile) {
      // User exists but no profile - use auth data as defaults
      form.reset({
        fullName: user.user_metadata?.full_name || '',
        email: user.email || '',
        phoneNumber: '',
        preferredPharmacy: '',
        languagePreference: 'en',
        notificationsEnabled: true,
      });
    }
  }, [user, profile, profileLoading, form]);

  // Redirect if not authenticated
  if (!user && !authLoading) {
    return <Navigate to="/login" replace />;
  }

  // Don't render the page until we have user data or confirmed no user
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const onSubmit = async (data: ProfileForm) => {
    setLoading(true);
    try {
      await updateProfile({
        phone_number: data.phoneNumber || null,
        preferred_pharmacy_id: data.preferredPharmacy === 'none' ? null : data.preferredPharmacy || null,
        language_preference: data.languagePreference,
        notifications_enabled: data.notificationsEnabled,
      });
      setIsEditing(false);
    } catch (error) {
      // Error handling is done in the updateProfile hook
    } finally {
      setLoading(false);
    }
  };

  const appointmentHistory = [
    {
      id: 1,
      pharmacy: "City Pharmacy",
      date: "2024-01-15",
      service: "Consultation",
      status: "Completed"
    },
    {
      id: 2,
      pharmacy: "MedCenter Plus",
      date: "2024-01-22",
      service: "Vaccination",
      status: "Completed"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="w-full max-w-none px-4 sm:px-6 lg:px-8 py-8">
        <div>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
              <p className="text-muted-foreground">Manage your account settings and preferences</p>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2"
            >
              <Edit2 className="h-4 w-4" />
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Profile Information */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Your full name"
                              {...field}
                              disabled={!isEditing}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="email"
                                placeholder="your.email@example.com"
                                className="pl-10"
                                {...field}
                                disabled={true} // Email typically can't be changed
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number <span className="text-muted-foreground">(optional)</span></FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="tel"
                                placeholder="+1 (555) 123-4567"
                                className="pl-10"
                                {...field}
                                disabled={!isEditing}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {isEditing && (
                      <Button
                        type="submit"
                        className="w-full bg-gradient-primary hover:opacity-90"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Updating...
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </Button>
                    )}
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Preferred Pharmacy
                  </Label>
                  <Select 
                    disabled={!isEditing}
                    value={form.watch('preferredPharmacy')}
                    onValueChange={(value) => form.setValue('preferredPharmacy', value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select a pharmacy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No preference</SelectItem>
                      <SelectItem value="city-pharmacy">City Pharmacy</SelectItem>
                      <SelectItem value="medcenter-plus">MedCenter Plus</SelectItem>
                      <SelectItem value="wellness-drugs">Wellness Drugs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Language Preference
                  </Label>
                  <Select 
                    disabled={!isEditing}
                    value={form.watch('languagePreference')}
                    onValueChange={(value) => form.setValue('languagePreference', value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    <Label>Notifications</Label>
                  </div>
                  <Switch 
                    disabled={!isEditing} 
                    checked={form.watch('notificationsEnabled')}
                    onCheckedChange={(checked) => form.setValue('notificationsEnabled', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Appointment History */}
            <Card className="shadow-card lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Appointment History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appointmentHistory.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-muted/30"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{appointment.pharmacy}</h4>
                        <p className="text-sm text-muted-foreground">{appointment.service}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">{appointment.date}</p>
                        <span className="inline-block px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {appointmentHistory.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No appointment history yet</p>
                      <p className="text-sm">Your upcoming and past appointments will appear here</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;