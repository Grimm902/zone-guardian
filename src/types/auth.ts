import { User, Session } from '@supabase/supabase-js';

export type UserRole = 'tcm' | 'sm' | 'dc' | 'fs' | 'tws' | 'tcp';

export interface Profile {
  id: string;
  email: string | null;
  full_name: string;
  phone: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  role: UserRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  updateProfile: (
    updates: Partial<Pick<Profile, 'full_name' | 'phone'>>
  ) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  tcm: 'Traffic Control Manager',
  sm: 'Safety Manager',
  dc: 'Dispatch Coordinator',
  fs: 'Field Supervisor',
  tws: 'Temporary Workplace Signer',
  tcp: 'Traffic Control Person',
};

export const ROLE_COLORS: Record<UserRole, string> = {
  tcm: 'bg-accent text-accent-foreground',
  sm: 'bg-success text-success-foreground',
  dc: 'bg-primary text-primary-foreground',
  fs: 'bg-secondary text-secondary-foreground',
  tws: 'bg-muted text-muted-foreground',
  tcp: 'bg-muted text-muted-foreground',
};
