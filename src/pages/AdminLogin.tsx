import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { toast } from 'sonner';

const adminLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  employeeId: z.string().min(1, 'Employee ID is required')
});

type AdminLoginForm = z.infer<typeof adminLoginSchema>;

const AdminLogin = () => {
  const navigate = useNavigate();
  const { user, signIn, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<AdminLoginForm>({
    resolver: zodResolver(adminLoginSchema)
  });

  // Redirect if already authenticated admin
  useEffect(() => {
    if (!authLoading && !roleLoading && user && role === 'admin') {
      navigate('/admin');
    }
  }, [user, role, authLoading, roleLoading, navigate]);

  const onSubmit = async (data: AdminLoginForm) => {
    setLoading(true);
    setError(null);

    try {
      // Check for hardcoded admin credentials
      if (
        data.email.endsWith('@medmehealth.com') &&
        data.employeeId === 'ADMIN001' &&
        data.password === '158332657'
      ) {
        // Grant immediate admin access for hardcoded credentials
        toast.success('Admin access granted');
        navigate('/admin');
        setLoading(false);
        return;
      }

      // Regular authentication flow for other users
      const { error: signInError } = await signIn(data.email, data.password);
      
      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      // Get the current session to get user ID
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) {
        setError('Authentication failed');
        setLoading(false);
        return;
      }

      // Check if user has admin role with matching employee ID
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role, employee_id')
        .eq('user_id', sessionData.session.user.id)
        .eq('role', 'admin')
        .eq('employee_id', data.employeeId)
        .single();

      if (roleError || !roleData) {
        // Sign out if not an admin or employee ID doesn't match
        await supabase.auth.signOut();
        setError('Invalid admin credentials or employee ID');
        setLoading(false);
        return;
      }

      toast.success('Admin login successful');
      navigate('/admin');
    } catch (error) {
      console.error('Admin login error:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <p className="text-sm text-muted-foreground">
            MedMe employee access only
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="your.email@medme.com"
                disabled={loading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="Enter your password"
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee ID</Label>
              <Input
                id="employeeId"
                {...register('employeeId')}
                placeholder="Enter your employee ID"
                disabled={loading}
              />
              {errors.employeeId && (
                <p className="text-sm text-destructive">{errors.employeeId.message}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in to Admin'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link 
              to="/" 
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Back to main site
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;