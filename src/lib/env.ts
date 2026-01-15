import { z } from 'zod';

/**
 * Environment variable schema
 * Validates all required environment variables at runtime
 */
const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url('VITE_SUPABASE_URL must be a valid URL'),
  VITE_SUPABASE_PUBLISHABLE_KEY: z.string().min(1, 'VITE_SUPABASE_PUBLISHABLE_KEY is required'),
  VITE_SENTRY_DSN: z.string().url().optional(),
});

/**
 * Cached validated environment variables
 * Validated lazily on first access
 */
let cachedEnv: z.infer<typeof envSchema> | null = null;

/**
 * Validates environment variables
 * Throws an error if validation fails
 */
const validateEnv = (): z.infer<typeof envSchema> => {
  if (cachedEnv) {
    return cachedEnv;
  }

  const parsed = envSchema.safeParse({
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
  });

  if (!parsed.success) {
    const errors = parsed.error.errors
      .map((err) => `${err.path.join('.')}: ${err.message}`)
      .join('\n');
    throw new Error(
      `Invalid environment variables:\n${errors}\n\n` +
        'Please check your .env file and ensure all required variables are set.\n' +
        'See .env.example for reference.'
    );
  }

  cachedEnv = parsed.data;
  return cachedEnv;
};

/**
 * Validated environment variables
 * Access this instead of import.meta.env directly for type safety
 * Uses lazy validation - only validates when properties are accessed
 * This allows the module to load in CI/build environments
 */
export const env = new Proxy({} as z.infer<typeof envSchema>, {
  get(_target, prop: keyof z.infer<typeof envSchema>) {
    const validated = validateEnv();
    return validated[prop];
  },
});

/**
 * Type-safe environment variable access
 */
export type Env = z.infer<typeof envSchema>;
