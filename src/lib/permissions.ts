import type { UserRole } from '@/types/auth';

// Full inventory management (CRUD on items, categories, locations, maintenance)
const INVENTORY_MANAGE_ROLES: UserRole[] = ['tcm', 'sm', 'dc', 'fs'];

/**
 * Checks if a user role can manage inventory (full CRUD access)
 * @param role - The user's role
 * @returns true if the role can manage inventory
 */
export const canManageInventory = (role: UserRole | null): boolean => {
  if (!role) return false;
  return INVENTORY_MANAGE_ROLES.includes(role);
};

// Check-out/check-in operations only
const INVENTORY_CHECKOUT_ROLES: UserRole[] = ['tcm', 'sm', 'dc', 'fs', 'tws'];

/**
 * Checks if a user role can checkout equipment (check-out/check-in operations)
 * @param role - The user's role
 * @returns true if the role can checkout equipment
 */
export const canCheckoutEquipment = (role: UserRole | null): boolean => {
  if (!role) return false;
  return INVENTORY_CHECKOUT_ROLES.includes(role);
};
