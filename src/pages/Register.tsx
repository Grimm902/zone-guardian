import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
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
import { registerSchema, type RegisterFormData } from '@/lib/validations';
import { UserPlus, AlertCircle, CheckCircle } from 'lucide-react';

const Register = () => {
  const { signUp, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/app" replace />;
  }

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setError(null);

    const { error: signUpError } = await signUp(data.email, data.password, data.fullName);

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        setError('An account with this email already exists. Please sign in instead.');
      } else {
        setError(signUpError.message || 'Failed to create account. Please try again.');
      }
      setIsSubmitting(false);
    } else {
      setSuccess(true);
      setTimeout(() => {
        navigate('/app');
      }, 1500);
    }
  };

  return (
    <AuthLayout title="Create an account" subtitle="Get started with TrafficControl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <Alert variant="destructive" className="animate-slide-down">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-success bg-success/10 animate-slide-down">
            <CheckCircle className="h-4 w-4 text-success" />
            <AlertDescription className="text-success">
              Account created successfully! Redirecting...
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <FormField label="Full Name" htmlFor="fullName" error={errors.fullName?.message}>
            <Input
              id="fullName"
              type="text"
              placeholder="John Smith"
              autoComplete="name"
              {...register('fullName')}
              className={errors.fullName ? 'border-destructive' : ''}
            />
          </FormField>

          <FormField label="Email" htmlFor="email" error={errors.email?.message}>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              {...register('email')}
              className={errors.email ? 'border-destructive' : ''}
            />
          </FormField>

          <FormField label="Password" htmlFor="password" error={errors.password?.message}>
            <PasswordInput
              id="password"
              placeholder="••••••••"
              autoComplete="new-password"
              {...register('password')}
              error={errors.password?.message}
            />
          </FormField>

          <FormField
            label="Confirm Password"
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

        <Button type="submit" className="w-full gap-2" disabled={isSubmitting || success}>
          {isSubmitting ? (
            <LoadingSpinner size="sm" />
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              Create account
            </>
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>

        <p className="text-center text-xs text-muted-foreground">
          By creating an account, you'll be assigned the default role of Traffic Control Person
          (TCP). Contact your administrator for role changes.
        </p>
      </form>
    </AuthLayout>
  );
};

export default Register;
