/**
 * Query key factory for React Query
 * Centralizes all query keys to ensure consistency and type safety
 */
export const queryKeys = {
  // Profile queries
  profiles: {
    all: ['profiles'] as const,
    detail: (id: string) => ['profiles', id] as const,
    current: () => ['profiles', 'current'] as const,
  },

  // Auth queries
  auth: {
    session: () => ['auth', 'session'] as const,
    user: () => ['auth', 'user'] as const,
  },

  // Settings queries
  settings: {
    current: () => ['settings', 'current'] as const,
  },

  // Inventory queries
  inventory: {
    categories: {
      all: ['inventory', 'categories'] as const,
      detail: (id: string) => ['inventory', 'categories', id] as const,
    },
    locations: {
      all: (includeInactive?: boolean) => ['inventory', 'locations', includeInactive] as const,
      detail: (id: string) => ['inventory', 'locations', id] as const,
    },
    equipment: {
      all: (filters?: unknown) => ['inventory', 'equipment', filters] as const,
      detail: (id: string) => ['inventory', 'equipment', id] as const,
    },
    checkouts: {
      all: (filters?: unknown) => ['inventory', 'checkouts', filters] as const,
      detail: (id: string) => ['inventory', 'checkouts', id] as const,
      active: () => ['inventory', 'checkouts', 'active'] as const,
    },
    maintenance: {
      all: (filters?: unknown) => ['inventory', 'maintenance', filters] as const,
      detail: (id: string) => ['inventory', 'maintenance', id] as const,
    },
  },
} as const;
