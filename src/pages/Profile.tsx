import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { RoleBadge } from '@/components/ui/role-badge';
import { PasswordInput } from '@/components/forms/PasswordInput';
import { FormField } from '@/components/forms/FormField';
import {
  profileSchema,
  passwordUpdateSchema,
  type ProfileFormData,
  type PasswordUpdateFormData,
} from '@/lib/validations';
import { ROLE_LABELS } from '@/types/auth';
import { User, Mail, Phone, Shield, Save, Key, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const Profile = () => {
  const { profile, role, updateProfile, updatePassword } = useAuth();
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
    },
  });

  const passwordForm = useForm<PasswordUpdateFormData>({
    resolver: zodResolver(passwordUpdateSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Update form when profile changes
  useEffect(() => {
    if (profile) {
      profileForm.reset({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
      });
    }
  }, [profile]);

  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsUpdatingProfile(true);
    setProfileError(null);

    const { error } = await updateProfile({
      full_name: data.full_name,
      phone: data.phone || null,
    });

    if (error) {
      setProfileError(error.message || 'Failed to update profile');
    } else {
      toast.success('Profile updated successfully');
    }
    setIsUpdatingProfile(false);
  };

  const onPasswordSubmit = async (data: PasswordUpdateFormData) => {
    setIsUpdatingPassword(true);
    setPasswordError(null);

    const { error } = await updatePassword(data.newPassword);

    if (error) {
      setPasswordError(error.message || 'Failed to update password');
    } else {
      toast.success('Password updated successfully');
      passwordForm.reset();
    }
    setIsUpdatingPassword(false);
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Profile Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account settings and update your profile information
          </p>
        </div>

        {/* Profile Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Profile Information
            </CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
              {profileError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{profileError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <FormField
                  label="Full Name"
                  htmlFor="full_name"
                  error={profileForm.formState.errors.full_name?.message}
                  icon={User}
                >
                  <Input
                    id="full_name"
                    {...profileForm.register('full_name')}
                    className={profileForm.formState.errors.full_name ? 'border-destructive' : ''}
                  />
                </FormField>

                <FormField label="Email" icon={Mail}>
                  <Input value={profile?.email || ''} disabled className="bg-muted" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Email cannot be changed. Contact your administrator if needed.
                  </p>
                </FormField>

                <FormField
                  label="Phone (Optional)"
                  htmlFor="phone"
                  error={profileForm.formState.errors.phone?.message}
                  icon={Phone}
                >
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    {...profileForm.register('phone')}
                    className={profileForm.formState.errors.phone ? 'border-destructive' : ''}
                  />
                </FormField>
              </div>

              <Button type="submit" className="gap-2" disabled={isUpdatingProfile}>
                {isUpdatingProfile ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Role Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Role & Permissions
            </CardTitle>
            <CardDescription>Your assigned role in the organization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="font-medium">{role ? ROLE_LABELS[role] : 'Unknown'}</p>
                <p className="text-sm text-muted-foreground">
                  Role changes can only be made by Traffic Control Managers
                </p>
              </div>
              {role && <RoleBadge role={role} />}
            </div>
          </CardContent>
        </Card>

        {/* Change Password Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              Change Password
            </CardTitle>
            <CardDescription>Update your account password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
              {passwordError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{passwordError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <FormField
                  label="New Password"
                  htmlFor="newPassword"
                  error={passwordForm.formState.errors.newPassword?.message}
                >
                  <PasswordInput
                    id="newPassword"
                    placeholder="••••••••"
                    {...passwordForm.register('newPassword')}
                    error={passwordForm.formState.errors.newPassword?.message}
                  />
                </FormField>

                <FormField
                  label="Confirm New Password"
                  htmlFor="confirmPassword"
                  error={passwordForm.formState.errors.confirmPassword?.message}
                >
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    {...passwordForm.register('confirmPassword')}
                    className={
                      passwordForm.formState.errors.confirmPassword ? 'border-destructive' : ''
                    }
                  />
                </FormField>
              </div>

              <Button type="submit" className="gap-2" disabled={isUpdatingPassword}>
                {isUpdatingPassword ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <Key className="h-4 w-4" />
                    Update Password
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Profile;
