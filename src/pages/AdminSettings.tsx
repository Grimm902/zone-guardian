import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { FormField } from '@/components/forms/FormField';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { systemSettingsSchema, type SystemSettingsFormData } from '@/lib/validations';
import { useSystemSettings, useUpdateSystemSettings } from '@/hooks/queries/useSystemSettings';
import { Settings, Building2, Globe, Image, Save, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

// Common timezones
const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'America/Anchorage',
  'America/Honolulu',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Rome',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Hong_Kong',
  'Asia/Dubai',
  'Australia/Sydney',
  'Australia/Melbourne',
];

// Date format options
const DATE_FORMATS = [
  { value: 'MM/dd/yyyy', label: 'MM/DD/YYYY (US)' },
  { value: 'dd/MM/yyyy', label: 'DD/MM/YYYY (EU)' },
  { value: 'yyyy-MM-dd', label: 'YYYY-MM-DD (ISO)' },
];

// Language options
const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ja', label: 'Japanese' },
];

const AdminSettings = () => {
  const { data: settings, isLoading, error } = useSystemSettings();
  const updateSettings = useUpdateSystemSettings();

  const form = useForm<SystemSettingsFormData>({
    resolver: zodResolver(systemSettingsSchema),
    mode: 'onSubmit',
    defaultValues: {
      organization_name: '',
      contact_email: '',
      contact_phone: '',
      contact_address: '',
      timezone: 'UTC',
      date_format: 'MM/dd/yyyy',
      time_format: '12h',
      logo_url: '',
      default_language: 'en',
      system_description: '',
    },
  });

  // Update form when settings load
  useEffect(() => {
    if (settings) {
      form.reset({
        organization_name: settings.organization_name || '',
        contact_email: settings.contact_email || '',
        contact_phone: settings.contact_phone || '',
        contact_address: settings.contact_address || '',
        timezone: settings.timezone || 'UTC',
        date_format: settings.date_format || 'MM/dd/yyyy',
        time_format: settings.time_format || '12h',
        logo_url: settings.logo_url || '',
        default_language: settings.default_language || 'en',
        system_description: settings.system_description || '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  const onSubmit = async (data: SystemSettingsFormData) => {
    try {
      await updateSettings.mutateAsync({
        organization_name: data.organization_name,
        contact_email: data.contact_email || null,
        contact_phone: data.contact_phone || null,
        contact_address: data.contact_address || null,
        timezone: data.timezone,
        date_format: data.date_format,
        time_format: data.time_format,
        logo_url: data.logo_url || null,
        default_language: data.default_language,
        system_description: data.system_description || null,
      });
      toast.success('System settings updated successfully');
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || 'Failed to update system settings');
    }
  };

  const handleReset = () => {
    if (settings) {
      form.reset({
        organization_name: settings.organization_name || '',
        contact_email: settings.contact_email || '',
        contact_phone: settings.contact_phone || '',
        contact_address: settings.contact_address || '',
        timezone: settings.timezone || 'UTC',
        date_format: settings.date_format || 'MM/dd/yyyy',
        time_format: settings.time_format || '12h',
        logo_url: settings.logo_url || '',
        default_language: settings.default_language || 'en',
        system_description: settings.system_description || '',
      });
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" text="Loading settings..." />
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load system settings. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">System Settings</h1>
          <p className="text-muted-foreground mt-2">
            Configure organization-wide settings and preferences
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Organization Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Organization Information
              </CardTitle>
              <CardDescription>Basic organization details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                label="Organization Name"
                htmlFor="organization_name"
                error={form.formState.errors.organization_name?.message}
                required
              >
                <Input
                  id="organization_name"
                  {...form.register('organization_name')}
                  className={form.formState.errors.organization_name ? 'border-destructive' : ''}
                />
              </FormField>

              <FormField
                label="Contact Email"
                htmlFor="contact_email"
                error={form.formState.errors.contact_email?.message}
              >
                <Input
                  id="contact_email"
                  type="email"
                  placeholder="contact@example.com"
                  {...form.register('contact_email')}
                  className={form.formState.errors.contact_email ? 'border-destructive' : ''}
                />
              </FormField>

              <FormField
                label="Contact Phone"
                htmlFor="contact_phone"
                error={form.formState.errors.contact_phone?.message}
              >
                <Input
                  id="contact_phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  {...form.register('contact_phone')}
                  className={form.formState.errors.contact_phone ? 'border-destructive' : ''}
                />
              </FormField>

              <FormField
                label="Contact Address"
                htmlFor="contact_address"
                error={form.formState.errors.contact_address?.message}
              >
                <Textarea
                  id="contact_address"
                  placeholder="123 Main St, City, State ZIP"
                  rows={3}
                  {...form.register('contact_address')}
                  className={form.formState.errors.contact_address ? 'border-destructive' : ''}
                />
              </FormField>
            </CardContent>
          </Card>

          {/* Localization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Localization
              </CardTitle>
              <CardDescription>Date, time, and language preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                label="Timezone"
                htmlFor="timezone"
                error={form.formState.errors.timezone?.message}
                required
              >
                <Controller
                  name="timezone"
                  control={form.control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id="timezone"
                        className={form.formState.errors.timezone ? 'border-destructive' : ''}
                      >
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIMEZONES.map((tz) => (
                          <SelectItem key={tz} value={tz}>
                            {tz}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  label="Date Format"
                  htmlFor="date_format"
                  error={form.formState.errors.date_format?.message}
                  required
                >
                  <Controller
                    name="date_format"
                    control={form.control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(value) =>
                          field.onChange(value as 'MM/dd/yyyy' | 'dd/MM/yyyy' | 'yyyy-MM-dd')
                        }
                      >
                        <SelectTrigger
                          id="date_format"
                          className={form.formState.errors.date_format ? 'border-destructive' : ''}
                        >
                          <SelectValue placeholder="Select date format" />
                        </SelectTrigger>
                        <SelectContent>
                          {DATE_FORMATS.map((format) => (
                            <SelectItem key={format.value} value={format.value}>
                              {format.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FormField>

                <FormField
                  label="Time Format"
                  htmlFor="time_format"
                  error={form.formState.errors.time_format?.message}
                  required
                >
                  <Controller
                    name="time_format"
                    control={form.control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(value) => field.onChange(value as '12h' | '24h')}
                      >
                        <SelectTrigger
                          id="time_format"
                          className={form.formState.errors.time_format ? 'border-destructive' : ''}
                        >
                          <SelectValue placeholder="Select time format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                          <SelectItem value="24h">24-hour</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FormField>
              </div>

              <FormField
                label="Default Language"
                htmlFor="default_language"
                error={form.formState.errors.default_language?.message}
                required
              >
                <Controller
                  name="default_language"
                  control={form.control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id="default_language"
                        className={
                          form.formState.errors.default_language ? 'border-destructive' : ''
                        }
                      >
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
            </CardContent>
          </Card>

          {/* Branding */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5 text-primary" />
                Branding
              </CardTitle>
              <CardDescription>Logo and system description</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                label="Logo URL"
                htmlFor="logo_url"
                error={form.formState.errors.logo_url?.message}
              >
                <Input
                  id="logo_url"
                  type="url"
                  placeholder="https://example.com/logo.png"
                  {...form.register('logo_url')}
                  className={form.formState.errors.logo_url ? 'border-destructive' : ''}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  URL to your organization logo image
                </p>
              </FormField>

              <FormField
                label="System Description"
                htmlFor="system_description"
                error={form.formState.errors.system_description?.message}
              >
                <Textarea
                  id="system_description"
                  placeholder="Brief description of the system..."
                  rows={4}
                  {...form.register('system_description')}
                  className={form.formState.errors.system_description ? 'border-destructive' : ''}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Optional description that may be displayed to users
                </p>
              </FormField>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={updateSettings.isPending}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reset Changes
                </Button>
                <Button type="submit" disabled={updateSettings.isPending} className="gap-2">
                  {updateSettings.isPending ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Settings
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </AppLayout>
  );
};

export default AdminSettings;
