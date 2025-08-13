import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Use the secure view that masks sensitive data by default
      const { data, error } = await supabase
        .from('appointments_safe_view')
        .select(`
          *,
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
      setAppointments((data || []) as Appointment[]);
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
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('appointments')
        .insert({
          ...appointmentData,
          user_id: user.id,
        })
        .select(`
          *,
          pharmacy:pharmacies (
            name,
            address,
            phone
          )
        `)
        .single();

      if (error) throw error;

      setAppointments(prev => [...prev, data as Appointment]);
      toast({
        title: "Appointment booked",
        description: "Your appointment has been successfully booked.",
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

  // Update appointment status
  const updateAppointmentStatus = async (appointmentId: string, status: Appointment['status']) => {
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