import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '@/services/supabase';
import { queryKeys } from './queryKeys';
import { useAuth } from '@/contexts/AuthContext';
import type { Profile, UserRole } from '@/types/auth';
import { logger } from '@/lib/logger';

/**
 * Hook to fetch the current user's profile
 */
export const useProfile = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.profiles.current(),
    queryFn: async () => {
      if (!user) {
        throw new Error('No user logged in');
      }

      const { data, error } = await profileService.getById(user.id);

      if (error) {
        logger.error('Failed to fetch profile', error);
        throw error;
      }

      return data;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch a profile by ID
 */
export const useProfileById = (userId: string | null) => {
  return useQuery({
    queryKey: queryKeys.profiles.detail(userId || ''),
    queryFn: async () => {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const { data, error } = await profileService.getById(userId);

      if (error) {
        logger.error('Failed to fetch profile', error);
        throw error;
      }

      return data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch all profiles (TCM only)
 */
export const useProfiles = () => {
  return useQuery({
    queryKey: queryKeys.profiles.all,
    queryFn: async () => {
      const { data, error } = await profileService.getAll();

      if (error) {
        logger.error('Failed to fetch profiles', error);
        throw error;
      }

      return data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to update profile
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (updates: Partial<Pick<Profile, 'full_name' | 'phone'>>) => {
      if (!user) {
        throw new Error('No user logged in');
      }

      const { data, error } = await profileService.update(user.id, updates);

      if (error) {
        logger.error('Failed to update profile', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch profile queries
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.all });
      if (user) {
        queryClient.setQueryData(queryKeys.profiles.detail(user.id), data);
        queryClient.setQueryData(queryKeys.profiles.current(), data);
      }
    },
  });
};

/**
 * Hook to update user role (TCM only)
 */
export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: UserRole }) => {
      const { data, error } = await profileService.updateRole(userId, role);

      if (error) {
        logger.error('Failed to update user role', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch profile queries
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.all });
      queryClient.setQueryData(queryKeys.profiles.detail(variables.userId), data);
    },
  });
};
