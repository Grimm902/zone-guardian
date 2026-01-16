/**
 * System settings types
 */

export interface SystemSettings {
  id: string;
  organization_name: string;
  contact_email: string | null;
  contact_phone: string | null;
  contact_address: string | null;
  timezone: string;
  date_format: string;
  time_format: '12h' | '24h';
  logo_url: string | null;
  default_language: string;
  system_description: string | null;
  created_at: string;
  updated_at: string;
}
