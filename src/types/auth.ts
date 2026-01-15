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

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'route' | 'action';
}

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  tcm: [
    {
      id: 'access-dashboard',
      name: 'Access Dashboard',
      description: 'View and access the main dashboard',
      category: 'route',
    },
    {
      id: 'access-profile',
      name: 'Access Profile',
      description: 'View and edit own profile page',
      category: 'route',
    },
    {
      id: 'view-own-profile',
      name: 'View Own Profile',
      description: 'View own profile information',
      category: 'action',
    },
    {
      id: 'update-own-profile',
      name: 'Update Own Profile',
      description: 'Update own profile (name, phone)',
      category: 'action',
    },
    {
      id: 'access-admin',
      name: 'Access Admin Dashboard',
      description: 'Access the admin dashboard',
      category: 'route',
    },
    {
      id: 'access-admin-users',
      name: 'Access User Management',
      description: 'Access the user management page',
      category: 'route',
    },
    {
      id: 'view-all-profiles',
      name: 'View All Profiles',
      description: 'View all user profiles in the system',
      category: 'action',
    },
    {
      id: 'update-any-profile',
      name: 'Update Any Profile',
      description: 'Update any user profile including role changes',
      category: 'action',
    },
  ],
  sm: [
    {
      id: 'access-dashboard',
      name: 'Access Dashboard',
      description: 'View and access the main dashboard',
      category: 'route',
    },
    {
      id: 'access-profile',
      name: 'Access Profile',
      description: 'View and edit own profile page',
      category: 'route',
    },
    {
      id: 'view-own-profile',
      name: 'View Own Profile',
      description: 'View own profile information',
      category: 'action',
    },
    {
      id: 'update-own-profile',
      name: 'Update Own Profile',
      description: 'Update own profile (name, phone only)',
      category: 'action',
    },
  ],
  dc: [
    {
      id: 'access-dashboard',
      name: 'Access Dashboard',
      description: 'View and access the main dashboard',
      category: 'route',
    },
    {
      id: 'access-profile',
      name: 'Access Profile',
      description: 'View and edit own profile page',
      category: 'route',
    },
    {
      id: 'view-own-profile',
      name: 'View Own Profile',
      description: 'View own profile information',
      category: 'action',
    },
    {
      id: 'update-own-profile',
      name: 'Update Own Profile',
      description: 'Update own profile (name, phone only)',
      category: 'action',
    },
  ],
  fs: [
    {
      id: 'access-dashboard',
      name: 'Access Dashboard',
      description: 'View and access the main dashboard',
      category: 'route',
    },
    {
      id: 'access-profile',
      name: 'Access Profile',
      description: 'View and edit own profile page',
      category: 'route',
    },
    {
      id: 'view-own-profile',
      name: 'View Own Profile',
      description: 'View own profile information',
      category: 'action',
    },
    {
      id: 'update-own-profile',
      name: 'Update Own Profile',
      description: 'Update own profile (name, phone only)',
      category: 'action',
    },
  ],
  tws: [
    {
      id: 'access-dashboard',
      name: 'Access Dashboard',
      description: 'View and access the main dashboard',
      category: 'route',
    },
    {
      id: 'access-profile',
      name: 'Access Profile',
      description: 'View and edit own profile page',
      category: 'route',
    },
    {
      id: 'view-own-profile',
      name: 'View Own Profile',
      description: 'View own profile information',
      category: 'action',
    },
    {
      id: 'update-own-profile',
      name: 'Update Own Profile',
      description: 'Update own profile (name, phone only)',
      category: 'action',
    },
  ],
  tcp: [
    {
      id: 'access-dashboard',
      name: 'Access Dashboard',
      description: 'View and access the main dashboard',
      category: 'route',
    },
    {
      id: 'access-profile',
      name: 'Access Profile',
      description: 'View and edit own profile page',
      category: 'route',
    },
    {
      id: 'view-own-profile',
      name: 'View Own Profile',
      description: 'View own profile information',
      category: 'action',
    },
    {
      id: 'update-own-profile',
      name: 'Update Own Profile',
      description: 'Update own profile (name, phone only)',
      category: 'action',
    },
  ],
};
