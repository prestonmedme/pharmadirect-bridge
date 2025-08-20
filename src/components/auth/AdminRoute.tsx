import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Skeleton } from '@/components/ui/skeleton';

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();

  // Check for hardcoded admin session
  const hardcodedSession = localStorage.getItem('medme_admin_session');
  let isHardcodedAdmin = false;
  
  if (hardcodedSession) {
    try {
      const session = JSON.parse(hardcodedSession);
      // Check if session is valid and recent (within 24 hours)
      const isValid = session.email?.endsWith('@medmehealth.com') && 
                      session.employeeId === 'ADMIN001' &&
                      (Date.now() - session.timestamp) < 24 * 60 * 60 * 1000;
      isHardcodedAdmin = isValid;
    } catch (error) {
      console.error('Error parsing hardcoded admin session:', error);
    }
  }

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
    );
  }

  // Allow access if either authenticated as admin OR has valid hardcoded session
  if (!user && !isHardcodedAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isHardcodedAdmin && role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}