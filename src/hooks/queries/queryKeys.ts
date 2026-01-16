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
} as const;
