export type EquipmentCondition = 'good' | 'fair' | 'damaged' | 'needs_repair' | 'retired';

export type LocationType = 'warehouse' | 'job_site';

export type MaintenanceType = 'inspection' | 'repair' | 'replacement';

export interface EquipmentCategory {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: string;
  name: string;
  type: LocationType;
  address: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EquipmentItem {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  code: string | null;
  quantity_total: number;
  quantity_available: number;
  unit_cost: number | null;
  condition: EquipmentCondition;
  location_id: string | null;
  image_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined data (optional)
  category?: EquipmentCategory;
  location?: Location;
}

export interface EquipmentCheckout {
  id: string;
  equipment_id: string;
  checked_out_by: string;
  checked_out_at: string;
  expected_return_date: string | null;
  checked_in_at: string | null;
  checked_in_by: string | null;
  quantity: number;
  destination_location_id: string | null;
  notes: string | null;
  // Joined data (optional)
  equipment?: EquipmentItem;
  checked_out_by_profile?: {
    id: string;
    full_name: string;
    email: string | null;
  };
  checked_in_by_profile?: {
    id: string;
    full_name: string;
    email: string | null;
  };
  destination_location?: Location;
}

export interface EquipmentMaintenance {
  id: string;
  equipment_id: string;
  maintenance_type: MaintenanceType;
  performed_by: string;
  performed_at: string;
  next_scheduled_date: string | null;
  notes: string | null;
  cost: number | null;
  // Joined data (optional)
  equipment?: EquipmentItem;
  performed_by_profile?: {
    id: string;
    full_name: string;
    email: string | null;
  };
}

// Form data types (for creating/updating)
export interface EquipmentCategoryFormData {
  name: string;
  description?: string;
}

export interface LocationFormData {
  name: string;
  type: LocationType;
  address?: string;
  is_active: boolean;
}

export interface EquipmentItemFormData {
  category_id: string;
  name: string;
  description?: string;
  code?: string;
  quantity_total: number;
  unit_cost?: number;
  condition: EquipmentCondition;
  location_id?: string;
  image_url?: string;
  notes?: string;
}

export interface EquipmentCheckoutFormData {
  equipment_id: string;
  quantity: number;
  expected_return_date?: string;
  destination_location_id?: string;
  notes?: string;
}

export interface EquipmentCheckinFormData {
  checkout_id: string;
  notes?: string;
}

export interface EquipmentMaintenanceFormData {
  equipment_id: string;
  maintenance_type: MaintenanceType;
  next_scheduled_date?: string;
  notes?: string;
  cost?: number;
}

// Filter/query types
export interface EquipmentFilters {
  category_id?: string;
  condition?: EquipmentCondition;
  location_id?: string;
  search?: string;
}

export interface CheckoutFilters {
  equipment_id?: string;
  checked_out_by?: string;
  is_checked_in?: boolean;
}

export interface MaintenanceFilters {
  equipment_id?: string;
  maintenance_type?: MaintenanceType;
  performed_by?: string;
}

// Condition labels and colors
export const CONDITION_LABELS: Record<EquipmentCondition, string> = {
  good: 'Good',
  fair: 'Fair',
  damaged: 'Damaged',
  needs_repair: 'Needs Repair',
  retired: 'Retired',
};

export const CONDITION_COLORS: Record<EquipmentCondition, string> = {
  good: 'bg-success text-success-foreground',
  fair: 'bg-yellow-500 text-yellow-900 dark:text-yellow-100',
  damaged: 'bg-orange-500 text-orange-900 dark:text-orange-100',
  needs_repair: 'bg-destructive text-destructive-foreground',
  retired: 'bg-muted text-muted-foreground',
};

// Location type labels
export const LOCATION_TYPE_LABELS: Record<LocationType, string> = {
  warehouse: 'Warehouse',
  job_site: 'Job Site',
};

// Maintenance type labels
export const MAINTENANCE_TYPE_LABELS: Record<MaintenanceType, string> = {
  inspection: 'Inspection',
  repair: 'Repair',
  replacement: 'Replacement',
};
