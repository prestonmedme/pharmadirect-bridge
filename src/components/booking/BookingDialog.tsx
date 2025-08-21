import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useSecureAppointments, type CreateAppointmentData } from "@/hooks/useSecureAppointments";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon, Clock, MapPin, Phone } from "lucide-react";
import type { Pharmacy } from "@/hooks/usePharmacySearch";
import { AnalyticsService } from "@/lib/analytics";

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pharmacy: Pharmacy | null;
  preselectedService?: string;
}

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00"
];

const serviceTypes = [
  { value: "minor-ailments", label: "Minor ailments" },
  { value: "flu-shots", label: "Flu shots" },
  { value: "medscheck", label: "MedsCheck" },
  { value: "naloxone", label: "Naloxone Kits" },
  { value: "birth-control", label: "Birth Control" },
  { value: "travel-vaccines", label: "Travel Vaccines" },
  { value: "diabetes", label: "Diabetes" },
  { value: "mental-health", label: "Mental Health" },
  { value: "consultation", label: "Consultation" },
  { value: "prescription-refill", label: "Prescription Refill" }
];

export const BookingDialog = ({ open, onOpenChange, pharmacy, preselectedService }: BookingDialogProps) => {
  const { user } = useAuth();
  const { createAppointment, loading } = useSecureAppointments();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [formData, setFormData] = useState({
    service_type: preselectedService || "",
    appointment_time: "",
    patient_name: "",
    patient_phone: "",
    patient_email: "",
    notes: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pharmacy || !selectedDate || !user) {
      return;
    }

    try {
      const appointmentData: CreateAppointmentData = {
        pharmacy_id: pharmacy.id,
        service_type: formData.service_type,
        appointment_date: format(selectedDate, 'yyyy-MM-dd'),
        appointment_time: formData.appointment_time,
        patient_name: formData.patient_name,
        patient_phone: formData.patient_phone || undefined,
        patient_email: formData.patient_email || undefined,
        notes: formData.notes || undefined
      };

      await createAppointment(appointmentData);
      
      // Track successful booking
      await AnalyticsService.trackBookingStep(
        'book_confirmed', 
        pharmacy.id, 
        formData.service_type,
        pharmacy.type === 'medme'
      );
      
      onOpenChange(false);
      
      // Reset form
      setFormData({
        service_type: preselectedService || "",
        appointment_time: "",
        patient_name: "",
        patient_phone: "",
        patient_email: "",
        notes: ""
      });
      setSelectedDate(undefined);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const isFormValid = () => {
    return (
      pharmacy &&
      selectedDate &&
      formData.service_type &&
      formData.appointment_time &&
      formData.patient_name.trim()
    );
  };

  if (!user) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign In Required</DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">
              Please sign in to book an appointment.
            </p>
            <Button onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book Appointment</DialogTitle>
        </DialogHeader>

        {pharmacy && (
          <div className="bg-muted/50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-foreground">{pharmacy.name}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <MapPin className="h-3 w-3" />
              {pharmacy.address}
            </div>
            {pharmacy.phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Phone className="h-3 w-3" />
                {pharmacy.phone}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="service">Service Type *</Label>
                <Select 
                  value={formData.service_type} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, service_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map((service) => (
                      <SelectItem key={service.value} value={service.value}>
                        {service.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Appointment Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="time">Time *</Label>
                <Select 
                  value={formData.appointment_time} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, appointment_time: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          {time}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Patient Name *</Label>
                <Input
                  id="name"
                  value={formData.patient_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, patient_name: e.target.value }))}
                  placeholder="Enter patient name"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.patient_phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, patient_phone: e.target.value }))}
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.patient_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, patient_email: e.target.value }))}
                  placeholder="patient@example.com"
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional information or special requests..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="medical" 
              disabled={!isFormValid() || loading}
              className="flex-1"
            >
              {loading ? "Booking..." : "Book Appointment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};