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
        // Log the full error context
        const isPermissionError =
          error.message?.includes('permission') || error.message?.includes('TCM');
        const isInitializationError =
          error.message?.includes('create') || error.message?.includes('initialize');

        logger.error('Failed to fetch system settings', {
          error: error.message,
          stack: error.stack,
          name: error.name,
          isPermissionError,
          isInitializationError,
          // Note: missing data errors should be rare now since we auto-create
          isMissingData: error.message?.includes('not found') || error.message?.includes('does not exist'),
        });
        throw error;
      }
      // The service layer now handles the case where data is null,
      // so if we get here without an error, data should exist
      if (!data) {
        // This should rarely happen now, but handle it as a fallback
        const fallbackError = new Error(
          'System settings not found. Please contact an administrator.'
        );
        logger.error('System settings not found (unexpected case)', {
          error: fallbackError.message,
          serviceResponse: { data, error },
        });
        throw fallbackError;
      }
      return data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on permission errors - they won't succeed on retry
      if (error instanceof Error && error.message?.includes('permission')) {
        return false;
      }
      // Retry once for other errors
      return failureCount < 1;
    },
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
        logger.error('Failed to update system settings', {
          error: error.message,
          stack: error.stack,
          updates: Object.keys(updates),
        });
        throw error;
      }
      if (!data) {
        const error = new Error(
          'Failed to update system settings. No data was returned.'
        );
        logger.error('System settings update returned no data', {
          updates: Object.keys(updates),
        });
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch settings after successful update
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.current() });
    },
    onError: (error: Error) => {
      // Additional error handling if needed
      logger.error('Mutation failed for system settings update', {
        error: error.message,
      });
    },
  });
};
