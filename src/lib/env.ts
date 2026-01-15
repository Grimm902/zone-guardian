import { z } from 'zod';

/**
 * Environment variable schema
 * Validates all required environment variables at runtime
 */
const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url('VITE_SUPABASE_URL must be a valid URL'),
  VITE_SUPABASE_PUBLISHABLE_KEY: z
    .string()
    .min(1, 'VITE_SUPABASE_PUBLISHABLE_KEY is required'),
});

/**
 * Validated environment variables
 * Throws an error at module load time if validation fails
 */
const parseEnv = () => {
  const parsed = envSchema.safeParse({
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  });

  if (!parsed.success) {
    const errors = parsed.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join('\n');
    throw new Error(
      `Invalid environment variables:\n${errors}\n\n` +
        'Please check your .env file and ensure all required variables are set.\n' +
        'See .env.example for reference.'
    );
  }

  return parsed.data;
};

/**
 * Validated environment variables
 * Access this instead of import.meta.env directly for type safety
 */
export const env = parseEnv();

/**
 * Type-safe environment variable access
 */
export type Env = typeof env;
