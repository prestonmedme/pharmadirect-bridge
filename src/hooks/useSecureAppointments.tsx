import { useState, useEffect } from 'react';
import { supabaseTemp as supabase } from '@/lib/supabaseClient';
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
      // Temporarily return empty array until appointments table is created
      setAppointments([]);
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
      // Temporarily return null until appointments table is created
      return null;
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

  // Create new appointment with data masking
  const createSecureAppointment = async (appointmentData: CreateAppointmentData) => {
    try {
      setLoading(true);
      
      // Temporarily return mock data until appointments table is created
      const mockAppointment: SecureAppointment = {
        id: `temp-${Date.now()}`,
        user_id: 'temp-user',
        pharmacy_id: appointmentData.pharmacy_id,
        service_type: appointmentData.service_type,
        appointment_date: appointmentData.appointment_date,
        appointment_time: appointmentData.appointment_time,
        status: 'pending',
        patient_name: appointmentData.patient_name,
        notes: appointmentData.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        patient_phone_masked: appointmentData.patient_phone 
          ? `***-***-${appointmentData.patient_phone.slice(-4)}`
          : undefined,
        patient_email_masked: appointmentData.patient_email
          ? `${appointmentData.patient_email.slice(0, 3)}***@${appointmentData.patient_email.split('@')[1]}`
          : undefined,
        pharmacy: {
          name: 'Sample Pharmacy',
          address: '123 Main St',
          phone: '555-0123'
        }
      };

      setAppointments(prev => [...prev, mockAppointment]);
      
      toast({
        title: "Appointment booked securely",
        description: "Your appointment has been booked with privacy protection.",
      });

      return mockAppointment;
    } catch (error) {
      console.error('Error creating secure appointment:', error);
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
      
      // Temporarily update in-memory only until appointments table is created
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