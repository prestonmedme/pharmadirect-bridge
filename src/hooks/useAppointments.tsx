import { useState, useEffect } from 'react';
import { supabaseTemp as supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';

export interface Appointment {
  id: string;
  user_id: string;
  pharmacy_id: string;
  service_type: string;
  appointment_date: string;
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  patient_name: string;
  patient_phone?: string;
  patient_email?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  pharmacy?: {
    name: string;
    address: string;
    phone?: string;
  };
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

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch user's appointments
  const fetchAppointments = async () => {
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

  // Create a new appointment
  const createAppointment = async (appointmentData: CreateAppointmentData) => {
    try {
      setLoading(true);
      
      // Temporarily return mock data until appointments table is created
      const mockAppointment = {
        id: `temp-${Date.now()}`,
        user_id: 'temp-user',
        ...appointmentData,
        status: 'pending' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        pharmacy: {
          name: 'Sample Pharmacy',
          address: '123 Main St',
          phone: '555-0123'
        }
      };

      setAppointments(prev => [...prev, mockAppointment]);
      toast({
        title: "Appointment booked",
        description: "Your appointment has been successfully booked.",
      });

      return mockAppointment;
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

  // Update appointment status
  const updateAppointmentStatus = async (appointmentId: string, status: Appointment['status']) => {
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
    fetchAppointments();
  }, []);

  return {
    appointments,
    loading,
    createAppointment,
    updateAppointmentStatus,
    cancelAppointment,
    fetchAppointments,
  };
};