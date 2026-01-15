import { PostgrestError } from '@supabase/supabase-js';

/**
 * User-friendly error message mapping
 * Maps technical errors to user-friendly messages
 */
const ERROR_MESSAGES: Record<string, string> = {
  // Authentication errors
  'Invalid login credentials': 'Invalid email or password. Please try again.',
  'Email not confirmed': 'Please check your email and confirm your account.',
  'User already registered': 'An account with this email already exists.',
  'Password should be at least 6 characters': 'Password must be at least 6 characters long.',
  'Invalid email': 'Please enter a valid email address.',

  // Network errors
  'Failed to fetch': 'Network error. Please check your internet connection.',
  'Network request failed': 'Network error. Please check your internet connection.',

  // Database errors
  'duplicate key value': 'This record already exists.',
  'violates foreign key constraint': 'Cannot delete this record as it is in use.',
  'violates unique constraint': 'This value already exists.',

  // Permission errors
  'permission denied': 'You do not have permission to perform this action.',
  'new row violates row-level security policy': 'You do not have permission to perform this action.',
};

/**
 * Checks if an error is a network error
 */
export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof Error) {
    return (
      error.message.includes('Failed to fetch') ||
      error.message.includes('Network request failed') ||
      error.message.includes('NetworkError') ||
      error.name === 'NetworkError'
    );
  }
  return false;
};

/**
 * Checks if an error is a Supabase PostgrestError
 */
export const isPostgrestError = (error: unknown): error is PostgrestError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    'details' in error
  );
};

/**
 * Extracts a user-friendly error message from an error
 */
export const getErrorMessage = (error: unknown, fallback = 'An unexpected error occurred'): string => {
  if (!error) {
    return fallback;
  }

  // Handle PostgrestError (Supabase database errors)
  if (isPostgrestError(error)) {
    const message = error.message || error.details || fallback;

    // Check for specific error patterns
    for (const [pattern, friendlyMessage] of Object.entries(ERROR_MESSAGES)) {
      if (message.toLowerCase().includes(pattern.toLowerCase())) {
        return friendlyMessage;
      }
    }

    return message;
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    const message = error.message;

    // Check for specific error patterns
    for (const [pattern, friendlyMessage] of Object.entries(ERROR_MESSAGES)) {
      if (message.toLowerCase().includes(pattern.toLowerCase())) {
        return friendlyMessage;
      }
    }

    return message || fallback;
  }

  // Handle string errors
  if (typeof error === 'string') {
    for (const [pattern, friendlyMessage] of Object.entries(ERROR_MESSAGES)) {
      if (error.toLowerCase().includes(pattern.toLowerCase())) {
        return friendlyMessage;
      }
    }
    return error;
  }

  return fallback;
};

/**
 * Creates a standardized error response
 */
export const createErrorResponse = <T = unknown>(
  error: unknown,
  fallbackMessage = 'An unexpected error occurred'
): { error: Error; data?: T } => {
  const message = getErrorMessage(error, fallbackMessage);
  return {
    error: error instanceof Error ? error : new Error(message),
    data: undefined,
  };
};

/**
 * Handles Supabase query errors consistently
 */
export const handleSupabaseError = <T>(
  data: T | null,
  error: PostgrestError | null
): { data: T | null; error: Error | null } => {
  if (error) {
    return {
      data: null,
      error: new Error(getErrorMessage(error)),
    };
  }
  return { data, error: null };
};
