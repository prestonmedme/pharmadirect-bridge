import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'admin' | 'user';

interface UserRole {
  role: AppRole;
  employee_id?: string;
  loading: boolean;
}

export function useUserRole(): UserRole {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole>('user');
  const [employeeId, setEmployeeId] = useState<string>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRole('user');
      setEmployeeId(undefined);
      setLoading(false);
      return;
    }

    const fetchUserRole = async () => {
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role, employee_id')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching user role:', error);
          setRole('user');
        } else if (data) {
          setRole(data.role);
          setEmployeeId(data.employee_id);
        } else {
          setRole('user');
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setRole('user');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  return {
    role,
    employee_id: employeeId,
    loading
  };
}

export function useIsAdmin(): boolean {
  const { role, loading } = useUserRole();
  return !loading && role === 'admin';
}