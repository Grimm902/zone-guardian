import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PasswordInput } from '@/components/forms/PasswordInput';
import { FormField } from '@/components/forms/FormField';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/validations';
import { Key, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const ResetPassword = () => {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    // Check if we have a valid recovery session
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsValidSession(!!session);
    };
    checkSession();
  }, []);

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsSubmitting(true);
    setError(null);

    const { error: updateError } = await updatePassword(data.password);

    if (updateError) {
      setError(updateError.message || 'Failed to update password. Please try again.');
    } else {
      setSuccess(true);
      setTimeout(() => {
        navigate('/app');
      }, 2000);
    }
    setIsSubmitting(false);
  };

  if (isValidSession === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" text="Verifying..." />
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <AuthLayout
        title="Invalid or expired link"
        subtitle="This password reset link is no longer valid"
      >
        <div className="space-y-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              The password reset link has expired or is invalid. Please request a new one.
            </AlertDescription>
          </Alert>

          <Link to="/forgot-password">
            <Button className="w-full">Request new reset link</Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Set new password" subtitle="Enter your new password below">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <Alert variant="destructive" className="animate-slide-down">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success ? (
          <div className="space-y-6 animate-fade-in">
            <Alert className="border-success bg-success/10">
              <CheckCircle className="h-4 w-4 text-success" />
              <AlertDescription className="text-success">
                Password updated successfully! Redirecting to dashboard...
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <FormField label="New Password" htmlFor="password" error={errors.password?.message}>
                <PasswordInput
                  id="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  {...register('password')}
                  error={errors.password?.message}
                />
              </FormField>

              <FormField
                label="Confirm New Password"
                htmlFor="confirmPassword"
                error={errors.confirmPassword?.message}
              >
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  {...register('confirmPassword')}
                  className={errors.confirmPassword ? 'border-destructive' : ''}
                />
              </FormField>
            </div>

            <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
              {isSubmitting ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Key className="h-4 w-4" />
                  Update password
                </>
              )}
            </Button>
          </>
        )}
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
