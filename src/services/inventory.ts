import { supabase } from '@/integrations/supabase/client';
import { handleSupabaseError } from '@/lib/errors';
import type {
  EquipmentCategory,
  EquipmentItem,
  Location,
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

/**
 * Equipment Category service
 * Handles all category-related database operations
 */
export const categoryService = {
  /**
   * Fetches all categories
   */
  async getAll(): Promise<{ data: EquipmentCategory[] | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('equipment_categories')
      .select('*')
      .order('name', { ascending: true });

    return handleSupabaseError(data as EquipmentCategory[] | null, error);
  },

  /**
   * Fetches a category by ID
   */
  async getById(id: string): Promise<{ data: EquipmentCategory | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('equipment_categories')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    return handleSupabaseError(data as EquipmentCategory | null, error);
  },

  /**
   * Creates a new category
   */
  async create(
    category: EquipmentCategoryFormData
  ): Promise<{ data: EquipmentCategory | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('equipment_categories')
      .insert(category)
      .select()
      .single();

    return handleSupabaseError(data as EquipmentCategory | null, error);
  },

  /**
   * Updates a category
   */
  async update(
    id: string,
    updates: Partial<EquipmentCategoryFormData>
  ): Promise<{ data: EquipmentCategory | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('equipment_categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    return handleSupabaseError(data as EquipmentCategory | null, error);
  },

  /**
   * Deletes a category
   */
  async delete(id: string): Promise<{ error: Error | null }> {
    const { error } = await supabase.from('equipment_categories').delete().eq('id', id);

    return { error: error ? new Error(error.message) : null };
  },
};

/**
 * Location service
 * Handles all location-related database operations
 */
export const locationService = {
  /**
   * Fetches all locations
   */
  async getAll(includeInactive = false): Promise<{ data: Location[] | null; error: Error | null }> {
    let query = supabase.from('locations').select('*').order('name', { ascending: true });

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    return handleSupabaseError(data as Location[] | null, error);
  },

  /**
   * Fetches a location by ID
   */
  async getById(id: string): Promise<{ data: Location | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    return handleSupabaseError(data as Location | null, error);
  },

  /**
   * Creates a new location
   */
  async create(location: LocationFormData): Promise<{ data: Location | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('locations')
      .insert(location)
      .select()
      .single();

    return handleSupabaseError(data as Location | null, error);
  },

  /**
   * Updates a location
   */
  async update(
    id: string,
    updates: Partial<LocationFormData>
  ): Promise<{ data: Location | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('locations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    return handleSupabaseError(data as Location | null, error);
  },

  /**
   * Deletes a location
   */
  async delete(id: string): Promise<{ error: Error | null }> {
    const { error } = await supabase.from('locations').delete().eq('id', id);

    return { error: error ? new Error(error.message) : null };
  },
};

/**
 * Equipment Item service
 * Handles all equipment item-related database operations
 */
export const equipmentService = {
  /**
   * Fetches all equipment items with optional filters
   */
  async getAll(
    filters?: EquipmentFilters
  ): Promise<{ data: EquipmentItem[] | null; error: Error | null }> {
    let query = supabase
      .from('equipment_items')
      .select('*, category:equipment_categories(*), location:locations(*)')
      .order('name', { ascending: true });

    if (filters?.category_id) {
      query = query.eq('category_id', filters.category_id);
    }

    if (filters?.condition) {
      query = query.eq('condition', filters.condition);
    }

    if (filters?.location_id) {
      query = query.eq('location_id', filters.location_id);
    }

    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,code.ilike.%${filters.search}%`
      );
    }

    const { data, error } = await query;

    return handleSupabaseError(data as EquipmentItem[] | null, error);
  },

  /**
   * Fetches an equipment item by ID
   */
  async getById(id: string): Promise<{ data: EquipmentItem | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('equipment_items')
      .select('*, category:equipment_categories(*), location:locations(*)')
      .eq('id', id)
      .maybeSingle();

    return handleSupabaseError(data as EquipmentItem | null, error);
  },

  /**
   * Creates a new equipment item
   */
  async create(
    item: EquipmentItemFormData
  ): Promise<{ data: EquipmentItem | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('equipment_items')
      .insert({
        ...item,
        quantity_available: item.quantity_total, // Initially all items are available
      })
      .select('*, category:equipment_categories(*), location:locations(*)')
      .single();

    return handleSupabaseError(data as EquipmentItem | null, error);
  },

  /**
   * Updates an equipment item
   */
  async update(
    id: string,
    updates: Partial<EquipmentItemFormData>
  ): Promise<{ data: EquipmentItem | null; error: Error | null }> {
    // If quantity_total is being updated, we need to adjust quantity_available
    const currentItem = await this.getById(id);
    if (currentItem.error || !currentItem.data) {
      return currentItem;
    }

    const newQuantityTotal = updates.quantity_total ?? currentItem.data.quantity_total;
    const currentAvailable = currentItem.data.quantity_available;
    const checkedOut = currentItem.data.quantity_total - currentAvailable;

    // Ensure available doesn't exceed total, and account for checked out items
    const newQuantityAvailable = Math.min(newQuantityTotal - checkedOut, newQuantityTotal);
    const finalQuantityAvailable = Math.max(0, newQuantityAvailable);

    const { data, error } = await supabase
      .from('equipment_items')
      .update({
        ...updates,
        quantity_available: updates.quantity_total !== undefined ? finalQuantityAvailable : undefined,
      })
      .eq('id', id)
      .select('*, category:equipment_categories(*), location:locations(*)')
      .single();

    return handleSupabaseError(data as EquipmentItem | null, error);
  },

  /**
   * Deletes an equipment item
   */
  async delete(id: string): Promise<{ error: Error | null }> {
    const { error } = await supabase.from('equipment_items').delete().eq('id', id);

    return { error: error ? new Error(error.message) : null };
  },
};

/**
 * Equipment Checkout service
 * Handles all checkout-related database operations
 */
export const checkoutService = {
  /**
   * Fetches all checkouts with optional filters
   */
  async getAll(
    filters?: CheckoutFilters
  ): Promise<{ data: EquipmentCheckout[] | null; error: Error | null }> {
    let query = supabase
      .from('equipment_checkouts')
      .select(
        '*, equipment:equipment_items(*, category:equipment_categories(*)), checked_out_by_profile:profiles!checked_out_by(id, full_name, email), checked_in_by_profile:profiles!checked_in_by(id, full_name, email), destination_location:locations(*)'
      )
      .order('checked_out_at', { ascending: false });

    if (filters?.equipment_id) {
      query = query.eq('equipment_id', filters.equipment_id);
    }

    if (filters?.checked_out_by) {
      query = query.eq('checked_out_by', filters.checked_out_by);
    }

    if (filters?.is_checked_in !== undefined) {
      if (filters.is_checked_in) {
        query = query.not('checked_in_at', 'is', null);
      } else {
        query = query.is('checked_in_at', null);
      }
    }

    const { data, error } = await query;

    return handleSupabaseError(data as EquipmentCheckout[] | null, error);
  },

  /**
   * Fetches a checkout by ID
   */
  async getById(id: string): Promise<{ data: EquipmentCheckout | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('equipment_checkouts')
      .select(
        '*, equipment:equipment_items(*, category:equipment_categories(*)), checked_out_by_profile:profiles!checked_out_by(id, full_name, email), checked_in_by_profile:profiles!checked_in_by(id, full_name, email), destination_location:locations(*)'
      )
      .eq('id', id)
      .maybeSingle();

    return handleSupabaseError(data as EquipmentCheckout | null, error);
  },

  /**
   * Creates a new checkout (checks out equipment)
   */
  async checkout(
    checkout: EquipmentCheckoutFormData,
    userId: string
  ): Promise<{ data: EquipmentCheckout | null; error: Error | null }> {
    // First, verify the equipment item exists and has enough available quantity
    const equipmentResult = await equipmentService.getById(checkout.equipment_id);
    if (equipmentResult.error || !equipmentResult.data) {
      return {
        data: null,
        error: equipmentResult.error || new Error('Equipment item not found'),
      };
    }

    if (equipmentResult.data.quantity_available < checkout.quantity) {
      return {
        data: null,
        error: new Error(
          `Insufficient quantity available. Only ${equipmentResult.data.quantity_available} available, but ${checkout.quantity} requested.`
        ),
      };
    }

    // Create the checkout record
    const { data: checkoutData, error: checkoutError } = await supabase
      .from('equipment_checkouts')
      .insert({
        ...checkout,
        checked_out_by: userId,
      })
      .select(
        '*, equipment:equipment_items(*, category:equipment_categories(*)), checked_out_by_profile:profiles!checked_out_by(id, full_name, email), destination_location:locations(*)'
      )
      .single();

    if (checkoutError) {
      return handleSupabaseError(null, checkoutError);
    }

    // Update the equipment item's available quantity
    const { error: updateError } = await supabase
      .from('equipment_items')
      .update({
        quantity_available: equipmentResult.data.quantity_available - checkout.quantity,
      })
      .eq('id', checkout.equipment_id);

    if (updateError) {
      return {
        data: null,
        error: new Error(`Failed to update equipment quantity: ${updateError.message}`),
      };
    }

    return { data: checkoutData as EquipmentCheckout, error: null };
  },

  /**
   * Checks in equipment (completes a checkout)
   */
  async checkin(
    checkin: EquipmentCheckinFormData,
    userId: string
  ): Promise<{ data: EquipmentCheckout | null; error: Error | null }> {
    // Get the checkout record
    const checkoutResult = await this.getById(checkin.checkout_id);
    if (checkoutResult.error || !checkoutResult.data) {
      return {
        data: null,
        error: checkoutResult.error || new Error('Checkout record not found'),
      };
    }

    if (checkoutResult.data.checked_in_at) {
      return {
        data: null,
        error: new Error('This equipment has already been checked in'),
      };
    }

    // Update the checkout record
    const { data: updatedCheckout, error: updateError } = await supabase
      .from('equipment_checkouts')
      .update({
        checked_in_at: new Date().toISOString(),
        checked_in_by: userId,
        notes: checkin.notes || checkoutResult.data.notes,
      })
      .eq('id', checkin.checkout_id)
      .select(
        '*, equipment:equipment_items(*, category:equipment_categories(*)), checked_out_by_profile:profiles!checked_out_by(id, full_name, email), checked_in_by_profile:profiles!checked_in_by(id, full_name, email), destination_location:locations(*)'
      )
      .single();

    if (updateError) {
      return handleSupabaseError(null, updateError);
    }

    // Update the equipment item's available quantity
    const equipmentResult = await equipmentService.getById(checkoutResult.data.equipment_id);
    if (equipmentResult.error || !equipmentResult.data) {
      return {
        data: null,
        error: equipmentResult.error || new Error('Equipment item not found'),
      };
    }

    const { error: quantityError } = await supabase
      .from('equipment_items')
      .update({
        quantity_available: equipmentResult.data.quantity_available + checkoutResult.data.quantity,
      })
      .eq('id', checkoutResult.data.equipment_id);

    if (quantityError) {
      return {
        data: null,
        error: new Error(`Failed to update equipment quantity: ${quantityError.message}`),
      };
    }

    return { data: updatedCheckout as EquipmentCheckout, error: null };
  },

  /**
   * Deletes a checkout record (managers only)
   */
  async delete(id: string): Promise<{ error: Error | null }> {
    const { error } = await supabase.from('equipment_checkouts').delete().eq('id', id);

    return { error: error ? new Error(error.message) : null };
  },
};

/**
 * Equipment Maintenance service
 * Handles all maintenance-related database operations
 */
export const maintenanceService = {
  /**
   * Fetches all maintenance records with optional filters
   */
  async getAll(
    filters?: MaintenanceFilters
  ): Promise<{ data: EquipmentMaintenance[] | null; error: Error | null }> {
    let query = supabase
      .from('equipment_maintenance')
      .select(
        '*, equipment:equipment_items(*, category:equipment_categories(*)), performed_by_profile:profiles!performed_by(id, full_name, email)'
      )
      .order('performed_at', { ascending: false });

    if (filters?.equipment_id) {
      query = query.eq('equipment_id', filters.equipment_id);
    }

    if (filters?.maintenance_type) {
      query = query.eq('maintenance_type', filters.maintenance_type);
    }

    if (filters?.performed_by) {
      query = query.eq('performed_by', filters.performed_by);
    }

    const { data, error } = await query;

    return handleSupabaseError(data as EquipmentMaintenance[] | null, error);
  },

  /**
   * Fetches a maintenance record by ID
   */
  async getById(id: string): Promise<{ data: EquipmentMaintenance | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('equipment_maintenance')
      .select(
        '*, equipment:equipment_items(*, category:equipment_categories(*)), performed_by_profile:profiles!performed_by(id, full_name, email)'
      )
      .eq('id', id)
      .maybeSingle();

    return handleSupabaseError(data as EquipmentMaintenance | null, error);
  },

  /**
   * Creates a new maintenance record
   */
  async create(
    maintenance: EquipmentMaintenanceFormData,
    userId: string
  ): Promise<{ data: EquipmentMaintenance | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('equipment_maintenance')
      .insert({
        ...maintenance,
        performed_by: userId,
      })
      .select(
        '*, equipment:equipment_items(*, category:equipment_categories(*)), performed_by_profile:profiles!performed_by(id, full_name, email)'
      )
      .single();

    return handleSupabaseError(data as EquipmentMaintenance | null, error);
  },

  /**
   * Updates a maintenance record
   */
  async update(
    id: string,
    updates: Partial<EquipmentMaintenanceFormData>
  ): Promise<{ data: EquipmentMaintenance | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('equipment_maintenance')
      .update(updates)
      .eq('id', id)
      .select(
        '*, equipment:equipment_items(*, category:equipment_categories(*)), performed_by_profile:profiles!performed_by(id, full_name, email)'
      )
      .single();

    return handleSupabaseError(data as EquipmentMaintenance | null, error);
  },

  /**
   * Deletes a maintenance record
   */
  async delete(id: string): Promise<{ error: Error | null }> {
    const { error } = await supabase.from('equipment_maintenance').delete().eq('id', id);

    return { error: error ? new Error(error.message) : null };
  },
};
