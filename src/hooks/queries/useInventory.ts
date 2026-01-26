import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  categoryService,
  locationService,
  equipmentService,
  checkoutService,
  maintenanceService,
} from '@/services/inventory';
import { queryKeys } from './queryKeys';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/lib/logger';
import type {
  EquipmentCategory,
  Location,
  EquipmentItem,
  EquipmentCheckout,
  EquipmentMaintenance,
  EquipmentCategoryFormData,
  LocationFormData,
  EquipmentItemFormData,
  EquipmentCheckoutFormData,
  EquipmentCheckinFormData,
  EquipmentMaintenanceFormData,
  EquipmentFilters,
  CheckoutFilters,
  MaintenanceFilters,
} from '@/types/inventory';

// ============================================================================
// Category Hooks
// ============================================================================

export const useCategories = () => {
  return useQuery({
    queryKey: queryKeys.inventory.categories.all,
    queryFn: async () => {
      const { data, error } = await categoryService.getAll();

      if (error) {
        logger.error('Failed to fetch categories', error);
        throw error;
      }

      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCategoryById = (id: string | null) => {
  return useQuery({
    queryKey: queryKeys.inventory.categories.detail(id || ''),
    queryFn: async () => {
      if (!id) {
        throw new Error('Category ID is required');
      }

      const { data, error } = await categoryService.getById(id);

      if (error) {
        logger.error('Failed to fetch category', error);
        throw error;
      }

      return data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (category: EquipmentCategoryFormData) => {
      const { data, error } = await categoryService.create(category);

      if (error) {
        logger.error('Failed to create category', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.categories.all });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<EquipmentCategoryFormData> }) => {
      const { data, error } = await categoryService.update(id, updates);

      if (error) {
        logger.error('Failed to update category', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.categories.all });
      queryClient.setQueryData(queryKeys.inventory.categories.detail(variables.id), data);
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await categoryService.delete(id);

      if (error) {
        logger.error('Failed to delete category', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.categories.all });
    },
  });
};

// ============================================================================
// Location Hooks
// ============================================================================

export const useLocations = (includeInactive = false) => {
  return useQuery({
    queryKey: queryKeys.inventory.locations.all(includeInactive),
    queryFn: async () => {
      const { data, error } = await locationService.getAll(includeInactive);

      if (error) {
        logger.error('Failed to fetch locations', error);
        throw error;
      }

      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useLocationById = (id: string | null) => {
  return useQuery({
    queryKey: queryKeys.inventory.locations.detail(id || ''),
    queryFn: async () => {
      if (!id) {
        throw new Error('Location ID is required');
      }

      const { data, error } = await locationService.getById(id);

      if (error) {
        logger.error('Failed to fetch location', error);
        throw error;
      }

      return data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (location: LocationFormData) => {
      const { data, error } = await locationService.create(location);

      if (error) {
        logger.error('Failed to create location', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.locations.all() });
    },
  });
};

export const useUpdateLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<LocationFormData> }) => {
      const { data, error } = await locationService.update(id, updates);

      if (error) {
        logger.error('Failed to update location', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.locations.all() });
      queryClient.setQueryData(queryKeys.inventory.locations.detail(variables.id), data);
    },
  });
};

export const useDeleteLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await locationService.delete(id);

      if (error) {
        logger.error('Failed to delete location', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.locations.all() });
    },
  });
};

// ============================================================================
// Equipment Item Hooks
// ============================================================================

export const useEquipment = (filters?: EquipmentFilters) => {
  return useQuery({
    queryKey: queryKeys.inventory.equipment.all(filters),
    queryFn: async () => {
      const { data, error } = await equipmentService.getAll(filters);

      if (error) {
        logger.error('Failed to fetch equipment', error);
        throw error;
      }

      return data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useEquipmentById = (id: string | null) => {
  return useQuery({
    queryKey: queryKeys.inventory.equipment.detail(id || ''),
    queryFn: async () => {
      if (!id) {
        throw new Error('Equipment ID is required');
      }

      const { data, error } = await equipmentService.getById(id);

      if (error) {
        logger.error('Failed to fetch equipment', error);
        throw error;
      }

      return data;
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};

export const useCreateEquipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: EquipmentItemFormData) => {
      const { data, error } = await equipmentService.create(item);

      if (error) {
        logger.error('Failed to create equipment', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.equipment.all() });
    },
  });
};

export const useUpdateEquipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<EquipmentItemFormData> }) => {
      const { data, error } = await equipmentService.update(id, updates);

      if (error) {
        logger.error('Failed to update equipment', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.equipment.all() });
      queryClient.setQueryData(queryKeys.inventory.equipment.detail(variables.id), data);
    },
  });
};

export const useDeleteEquipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await equipmentService.delete(id);

      if (error) {
        logger.error('Failed to delete equipment', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.equipment.all() });
    },
  });
};

// ============================================================================
// Checkout Hooks
// ============================================================================

export const useCheckouts = (filters?: CheckoutFilters) => {
  return useQuery({
    queryKey: queryKeys.inventory.checkouts.all(filters),
    queryFn: async () => {
      const { data, error } = await checkoutService.getAll(filters);

      if (error) {
        logger.error('Failed to fetch checkouts', error);
        throw error;
      }

      return data || [];
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useCheckoutById = (id: string | null) => {
  return useQuery({
    queryKey: queryKeys.inventory.checkouts.detail(id || ''),
    queryFn: async () => {
      if (!id) {
        throw new Error('Checkout ID is required');
      }

      const { data, error } = await checkoutService.getById(id);

      if (error) {
        logger.error('Failed to fetch checkout', error);
        throw error;
      }

      return data;
    },
    enabled: !!id,
    staleTime: 1 * 60 * 1000,
  });
};

export const useActiveCheckouts = () => {
  return useCheckouts({ is_checked_in: false });
};

export const useCheckoutEquipment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (checkout: EquipmentCheckoutFormData) => {
      if (!user) {
        throw new Error('No user logged in');
      }

      const { data, error } = await checkoutService.checkout(checkout, user.id);

      if (error) {
        logger.error('Failed to checkout equipment', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.checkouts.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.equipment.all() });
      if (data?.equipment_id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.inventory.equipment.detail(data.equipment_id),
        });
      }
    },
  });
};

export const useCheckinEquipment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (checkin: EquipmentCheckinFormData) => {
      if (!user) {
        throw new Error('No user logged in');
      }

      const { data, error } = await checkoutService.checkin(checkin, user.id);

      if (error) {
        logger.error('Failed to checkin equipment', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.checkouts.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.equipment.all() });
      if (data?.equipment_id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.inventory.equipment.detail(data.equipment_id),
        });
      }
    },
  });
};

export const useDeleteCheckout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await checkoutService.delete(id);

      if (error) {
        logger.error('Failed to delete checkout', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.checkouts.all() });
    },
  });
};

// ============================================================================
// Maintenance Hooks
// ============================================================================

export const useMaintenance = (filters?: MaintenanceFilters) => {
  return useQuery({
    queryKey: queryKeys.inventory.maintenance.all(filters),
    queryFn: async () => {
      const { data, error } = await maintenanceService.getAll(filters);

      if (error) {
        logger.error('Failed to fetch maintenance records', error);
        throw error;
      }

      return data || [];
    },
    staleTime: 2 * 60 * 1000,
  });
};

export const useMaintenanceById = (id: string | null) => {
  return useQuery({
    queryKey: queryKeys.inventory.maintenance.detail(id || ''),
    queryFn: async () => {
      if (!id) {
        throw new Error('Maintenance ID is required');
      }

      const { data, error } = await maintenanceService.getById(id);

      if (error) {
        logger.error('Failed to fetch maintenance record', error);
        throw error;
      }

      return data;
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};

export const useCreateMaintenance = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (maintenance: EquipmentMaintenanceFormData) => {
      if (!user) {
        throw new Error('No user logged in');
      }

      const { data, error } = await maintenanceService.create(maintenance, user.id);

      if (error) {
        logger.error('Failed to create maintenance record', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.maintenance.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.equipment.all() });
      if (data?.equipment_id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.inventory.equipment.detail(data.equipment_id),
        });
      }
    },
  });
};

export const useUpdateMaintenance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<EquipmentMaintenanceFormData>;
    }) => {
      const { data, error } = await maintenanceService.update(id, updates);

      if (error) {
        logger.error('Failed to update maintenance record', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.maintenance.all() });
      queryClient.setQueryData(queryKeys.inventory.maintenance.detail(variables.id), data);
    },
  });
};

export const useDeleteMaintenance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await maintenanceService.delete(id);

      if (error) {
        logger.error('Failed to delete maintenance record', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.maintenance.all() });
    },
  });
};
