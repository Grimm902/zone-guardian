import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '@/services/supabase';
import { queryKeys } from './queryKeys';
import type { SystemSettings } from '@/types/settings';
import { logger } from '@/lib/logger';

/**
 * Hook to fetch system settings
 */
export const useSystemSettings = () => {
  return useQuery({
    queryKey: queryKeys.settings.current(),
    queryFn: async () => {
      const { data, error } = await settingsService.get();
      if (error) {
        logger.error('Failed to fetch system settings', error);
        throw error;
      }
      return data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to update system settings
 */
export const useUpdateSystemSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      updates: Partial<Omit<SystemSettings, 'id' | 'created_at' | 'updated_at'>>
    ) => {
      const { data, error } = await settingsService.update(updates);
      if (error) {
        logger.error('Failed to update system settings', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.current() });
    },
  });
};
