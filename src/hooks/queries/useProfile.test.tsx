import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useProfile,
  useProfileById,
  useProfiles,
  useUpdateProfile,
  useUpdateUserRole,
} from './useProfile';
import { profileService } from '@/services/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { mockProfile, mockProfiles, mockUser } from '@/test/fixtures';

// Mock dependencies
vi.mock('@/services/supabase');
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useProfile', () => {
    it('should fetch current user profile successfully', async () => {
      (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
        user: mockUser,
      });

      (profileService.getById as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      const { result } = renderHook(() => useProfile(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockProfile);
      expect(profileService.getById).toHaveBeenCalledWith(mockUser.id);
    });

    it('should not fetch when user is not logged in', () => {
      (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
        user: null,
      });

      const { result } = renderHook(() => useProfile(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isPending).toBe(true);
      expect(profileService.getById).not.toHaveBeenCalled();
    });

    it('should handle errors when fetching profile', async () => {
      (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
        user: mockUser,
      });

      const error = new Error('Failed to fetch profile');
      (profileService.getById as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: null,
        error,
      });

      const { result } = renderHook(() => useProfile(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBe(error);
    });
  });

  describe('useProfileById', () => {
    it('should fetch profile by ID successfully', async () => {
      (profileService.getById as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      const { result } = renderHook(() => useProfileById('user-123'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockProfile);
      expect(profileService.getById).toHaveBeenCalledWith('user-123');
    });

    it('should not fetch when userId is null', () => {
      const { result } = renderHook(() => useProfileById(null), {
        wrapper: createWrapper(),
      });

      expect(result.current.isPending).toBe(true);
      expect(profileService.getById).not.toHaveBeenCalled();
    });

    it('should handle errors when fetching profile by ID', async () => {
      const error = new Error('Profile not found');
      (profileService.getById as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: null,
        error,
      });

      const { result } = renderHook(() => useProfileById('invalid-id'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBe(error);
    });
  });

  describe('useProfiles', () => {
    it('should fetch all profiles successfully', async () => {
      (profileService.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: mockProfiles,
        error: null,
      });

      const { result } = renderHook(() => useProfiles(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockProfiles);
      expect(profileService.getAll).toHaveBeenCalled();
    });

    it('should handle empty results', async () => {
      (profileService.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: [],
        error: null,
      });

      const { result } = renderHook(() => useProfiles(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });

    it('should handle errors when fetching all profiles', async () => {
      const error = new Error('Failed to fetch profiles');
      (profileService.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: null,
        error,
      });

      const { result } = renderHook(() => useProfiles(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBe(error);
    });
  });

  describe('useUpdateProfile', () => {
    it('should update profile successfully', async () => {
      (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
        user: mockUser,
      });

      const updatedProfile = { ...mockProfile, full_name: 'Updated Name' };
      (profileService.update as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: updatedProfile,
        error: null,
      });

      const { result } = renderHook(() => useUpdateProfile(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ full_name: 'Updated Name' });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(profileService.update).toHaveBeenCalledWith(mockUser.id, {
        full_name: 'Updated Name',
      });
      expect(result.current.data).toEqual(updatedProfile);
    });

    it('should handle errors when updating profile', async () => {
      (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
        user: mockUser,
      });

      const error = new Error('Update failed');
      (profileService.update as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: null,
        error,
      });

      const { result } = renderHook(() => useUpdateProfile(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ full_name: 'Updated Name' });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBe(error);
    });

    it('should throw error when no user is logged in', async () => {
      (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
        user: null,
      });

      const { result } = renderHook(() => useUpdateProfile(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ full_name: 'Updated Name' });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error?.message).toBe('No user logged in');
    });
  });

  describe('useUpdateUserRole', () => {
    it('should update user role successfully', async () => {
      const updatedProfile = { ...mockProfile, role: 'sm' as const };
      (profileService.updateRole as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: updatedProfile,
        error: null,
      });

      const { result } = renderHook(() => useUpdateUserRole(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ userId: 'user-123', role: 'sm' });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(profileService.updateRole).toHaveBeenCalledWith('user-123', 'sm');
      expect(result.current.data).toEqual(updatedProfile);
    });

    it('should handle errors when updating user role', async () => {
      const error = new Error('Permission denied');
      (profileService.updateRole as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: null,
        error,
      });

      const { result } = renderHook(() => useUpdateUserRole(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ userId: 'user-123', role: 'sm' });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBe(error);
    });
  });
});
