import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SecureAppointment {
  id: string;
  user_id: string;
  pharmacy_id: string;
  service_type: string;
  appointment_date: string;
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  patient_name: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Masked sensitive data
  patient_phone_masked?: string;
  patient_email_masked?: string;
  pharmacy?: {
    name: string;
    address: string;
    phone?: string;
  };
}

export interface SensitiveData {
  patient_phone?: string;
  patient_email?: string;
}

export interface CreateAppointmentData {
  pharmacy_id: string;
  service_type: string;
  appointment_date: string;
  appointment_time: string;
  patient_name: string;
  patient_phone?: string;
  patient_email?: string;
  notes?: string;
}

export const useSecureAppointments = () => {
  const [appointments, setAppointments] = useState<SecureAppointment[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch appointments with masked sensitive data
  const fetchSecureAppointments = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Use regular appointments table but manually mask sensitive data
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          user_id,
          pharmacy_id,
          service_type,
          appointment_date,
          appointment_time,
          status,
          patient_name,
          patient_phone,
          patient_email,
          notes,
          created_at,
          updated_at,
          pharmacy:pharmacies (
            name,
            address,
            phone
          )
        `)
        .eq('user_id', user.id)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });

      if (error) throw error;

      // Mask sensitive data client-side for display
      const maskedAppointments = (data || []).map(appointment => ({
        ...appointment,
        patient_phone_masked: appointment.patient_phone 
          ? `***-***-${appointment.patient_phone.slice(-4)}`
          : undefined,
        patient_email_masked: appointment.patient_email
          ? `${appointment.patient_email.slice(0, 3)}***@${appointment.patient_email.split('@')[1]}`
          : undefined,
        // Remove actual sensitive data from the display object
        patient_phone: undefined,
        patient_email: undefined,
      }));

      setAppointments(maskedAppointments as SecureAppointment[]);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        variant: "destructive",
        title: "Error fetching appointments",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  // Get sensitive data with explicit consent (for editing/viewing)
  const getSensitiveData = async (appointmentId: string, explicitConsent: boolean = false): Promise<SensitiveData | null> => {
    if (!explicitConsent) {
      toast({
        variant: "destructive",
        title: "Consent required",
        description: "Explicit consent is required to access sensitive personal data",
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('patient_phone, patient_email')
        .eq('id', appointmentId)
        .single();

      if (error) throw error;

      // Log access to sensitive data (you could implement audit logging here)
      console.log(`Sensitive data accessed for appointment ${appointmentId} at ${new Date().toISOString()}`);
      
      return {
        patient_phone: data.patient_phone,
        patient_email: data.patient_email,
      };
    } catch (error) {
      console.error('Error fetching sensitive data:', error);
      toast({
        variant: "destructive",
        title: "Error accessing sensitive data",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
      return null;
    }
  };

  // Create appointment with data minimization
  const createSecureAppointment = async (appointmentData: CreateAppointmentData) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Validate and sanitize input data
      const sanitizedData = {
        ...appointmentData,
        user_id: user.id,
        // Only store phone/email if they're actually provided and not empty
        patient_phone: appointmentData.patient_phone?.trim() || null,
        patient_email: appointmentData.patient_email?.trim() || null,
        patient_name: appointmentData.patient_name.trim(),
        notes: appointmentData.notes?.trim() || null,
      };

      const { data, error } = await supabase
        .from('appointments')
        .insert(sanitizedData)
        .select(`
          id,
          user_id,
          pharmacy_id,
          service_type,
          appointment_date,
          appointment_time,
          status,
          patient_name,
          notes,
          created_at,
          updated_at,
          pharmacy:pharmacies (
            name,
            address,
            phone
          )
        `)
        .single();

      if (error) throw error;

      // Add the new appointment with masked data
      const maskedAppointment = {
        ...data,
        patient_phone_masked: sanitizedData.patient_phone 
          ? `***-***-${sanitizedData.patient_phone.slice(-4)}`
          : undefined,
        patient_email_masked: sanitizedData.patient_email
          ? `${sanitizedData.patient_email.slice(0, 3)}***@${sanitizedData.patient_email.split('@')[1]}`
          : undefined,
      } as SecureAppointment;

      setAppointments(prev => [...prev, maskedAppointment]);
      
      toast({
        title: "Appointment booked securely",
        description: "Your appointment has been successfully booked with data protection measures in place.",
      });

      return data;
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast({
        variant: "destructive",
        title: "Error booking appointment",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update appointment status (no sensitive data involved)
  const updateAppointmentStatus = async (appointmentId: string, status: SecureAppointment['status']) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointmentId);

      if (error) throw error;

      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId ? { ...apt, status } : apt
        )
      );

      toast({
        title: "Appointment updated",
        description: `Appointment status changed to ${status}.`,
      });
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast({
        variant: "destructive",
        title: "Error updating appointment",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  // Cancel appointment
  const cancelAppointment = async (appointmentId: string) => {
    await updateAppointmentStatus(appointmentId, 'cancelled');
  };

  // Load appointments on mount
  useEffect(() => {
    fetchSecureAppointments();
  }, []);

  return {
    appointments,
    loading,
    createAppointment: createSecureAppointment,
    updateAppointmentStatus,
    cancelAppointment,
    fetchAppointments: fetchSecureAppointments,
    getSensitiveData, // For when you explicitly need sensitive data
  };
};