import type { Profile, UserRole } from '@/types/auth';
import type { User, Session } from '@supabase/supabase-js';

export const mockProfile: Profile = {
  id: 'user-123',
  email: 'test@example.com',
  full_name: 'Test User',
  phone: '1234567890',
  role: 'tcm',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export const mockProfileTcp: Profile = {
  id: 'user-456',
  email: 'tcp@example.com',
  full_name: 'TCP User',
  phone: null,
  role: 'tcp',
  created_at: '2024-01-02T00:00:00Z',
  updated_at: '2024-01-02T00:00:00Z',
};

export const mockUser: User = {
  id: 'user-123',
  email: 'test@example.com',
  created_at: '2024-01-01T00:00:00Z',
  app_metadata: {},
  user_metadata: {
    full_name: 'Test User',
  },
  aud: 'authenticated',
  confirmation_sent_at: null,
  recovery_sent_at: null,
  email_change_sent_at: null,
  new_email: null,
  invited_at: null,
  action_link: null,
  phone: null,
  confirmed_at: '2024-01-01T00:00:00Z',
  email_confirmed_at: '2024-01-01T00:00:00Z',
  phone_confirmed_at: null,
  last_sign_in_at: '2024-01-01T00:00:00Z',
  role: 'authenticated',
  updated_at: '2024-01-01T00:00:00Z',
};

export const mockSession: Session = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Date.now() / 1000 + 3600,
  token_type: 'bearer',
  user: mockUser,
};

export const createMockProfile = (overrides?: Partial<Profile>): Profile => ({
  ...mockProfile,
  ...overrides,
});

export const createMockUser = (overrides?: Partial<User>): User => ({
  ...mockUser,
  ...overrides,
});

export const createMockSession = (overrides?: Partial<Session>): Session => ({
  ...mockSession,
  ...overrides,
  user: overrides?.user || mockUser,
});

export const mockProfiles: Profile[] = [
  mockProfile,
  mockProfileTcp,
  {
    id: 'user-789',
    email: 'sm@example.com',
    full_name: 'Safety Manager',
    phone: '9876543210',
    role: 'sm',
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z',
  },
];
