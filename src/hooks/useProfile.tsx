import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Profile {
  id: string;
  user_id: string;
  phone_number: string | null;
  preferred_pharmacy_id: string | null;
  language_preference: string;
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProfileUpdate {
  phone_number?: string | null;
  preferred_pharmacy_id?: string | null;
  language_preference?: string;
  notifications_enabled?: boolean;
}

export const useProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch profile data
  const fetchProfile = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        toast({
          variant: "destructive",
          title: "Error loading profile",
          description: "Failed to load your profile data.",
        });
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
      toast({
        variant: "destructive",
        title: "Error loading profile",
        description: "An unexpected error occurred.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Update profile data
  const updateProfile = async (updates: ProfileUpdate) => {
    if (!user) {
      throw new Error('No authenticated user');
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }

      setProfile(data);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });

      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "Failed to update your profile. Please try again.",
      });
      throw error;
    }
  };

  // Create profile if it doesn't exist
  const createProfile = async () => {
    if (!user) {
      throw new Error('No authenticated user');
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          language_preference: 'en',
          notifications_enabled: true,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        throw error;
      }

      setProfile(data);
      return data;
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  };

  // Initialize profile on user change
  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  return {
    profile,
    loading,
    updateProfile,
    createProfile,
    refetch: fetchProfile,
  };
};