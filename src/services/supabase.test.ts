import { describe, it, expect, vi, beforeEach } from 'vitest';
import { profileService } from './supabase';
import { supabase } from '@/integrations/supabase/client';
import type { Profile } from '@/types/auth';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('profileService', () => {
  const mockSelect = vi.fn();
  const mockEq = vi.fn();
  const mockMaybeSingle = vi.fn();
  const mockSingle = vi.fn();
  const mockOrder = vi.fn();
  const mockUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockSelect.mockReturnValue({
      eq: mockEq,
      order: mockOrder,
      maybeSingle: mockMaybeSingle,
      single: mockSingle,
    });
    mockEq.mockReturnValue({
      maybeSingle: mockMaybeSingle,
      single: mockSingle,
    });
    mockOrder.mockReturnValue({
      maybeSingle: mockMaybeSingle,
    });
    mockUpdate.mockReturnValue({
      eq: mockEq,
      select: mockSelect,
    });
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
      select: mockSelect,
      update: mockUpdate,
    });
  });

  describe('getById', () => {
    it('should fetch profile by user ID successfully', async () => {
      const mockProfile: Profile = {
        id: 'user-123',
        email: 'test@example.com',
        full_name: 'Test User',
        phone: '1234567890',
        role: 'tcm',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockMaybeSingle.mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      const result = await profileService.getById('user-123');

      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('id', 'user-123');
      expect(result.data).toEqual(mockProfile);
      expect(result.error).toBeNull();
    });

    it('should handle errors when fetching profile', async () => {
      const mockError = {
        message: 'Database error',
        code: 'PGRST116',
        details: 'Error details',
        hint: 'Error hint',
      };

      mockMaybeSingle.mockResolvedValue({
        data: null,
        error: mockError,
      });

      const result = await profileService.getById('user-123');

      expect(result.data).toBeNull();
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe('Database error');
    });
  });

  describe('getAll', () => {
    it('should fetch all profiles successfully', async () => {
      const mockProfiles: Profile[] = [
        {
          id: 'user-1',
          email: 'user1@example.com',
          full_name: 'User 1',
          phone: null,
          role: 'tcm',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: 'user-2',
          email: 'user2@example.com',
          full_name: 'User 2',
          phone: '1234567890',
          role: 'tcp',
          created_at: '2024-01-02T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
        },
      ];

      mockMaybeSingle.mockResolvedValue({
        data: mockProfiles,
        error: null,
      });

      const result = await profileService.getAll();

      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result.data).toEqual(mockProfiles);
      expect(result.error).toBeNull();
    });
  });

  describe('update', () => {
    it('should update profile successfully', async () => {
      const mockUpdatedProfile: Profile = {
        id: 'user-123',
        email: 'test@example.com',
        full_name: 'Updated Name',
        phone: '9876543210',
        role: 'tcm',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockSingle.mockResolvedValue({
        data: mockUpdatedProfile,
        error: null,
      });

      const result = await profileService.update('user-123', {
        full_name: 'Updated Name',
        phone: '9876543210',
      });

      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(mockUpdate).toHaveBeenCalledWith({
        full_name: 'Updated Name',
        phone: '9876543210',
      });
      expect(mockEq).toHaveBeenCalledWith('id', 'user-123');
      expect(result.data).toEqual(mockUpdatedProfile);
      expect(result.error).toBeNull();
    });

    it('should handle errors when updating profile', async () => {
      const mockError = {
        message: 'Update failed',
        code: 'PGRST116',
        details: 'Error details',
        hint: 'Error hint',
      };

      mockSingle.mockResolvedValue({
        data: null,
        error: mockError,
      });

      const result = await profileService.update('user-123', {
        full_name: 'Updated Name',
      });

      expect(result.data).toBeNull();
      expect(result.error).toBeInstanceOf(Error);
    });
  });

  describe('updateRole', () => {
    it('should update user role successfully', async () => {
      const mockUpdatedProfile: Profile = {
        id: 'user-123',
        email: 'test@example.com',
        full_name: 'Test User',
        phone: null,
        role: 'sm',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockSingle.mockResolvedValue({
        data: mockUpdatedProfile,
        error: null,
      });

      const result = await profileService.updateRole('user-123', 'sm');

      expect(mockUpdate).toHaveBeenCalledWith({ role: 'sm' });
      expect(result.data).toEqual(mockUpdatedProfile);
      expect(result.error).toBeNull();
    });
  });
});
