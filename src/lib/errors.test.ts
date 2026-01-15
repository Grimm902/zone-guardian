import { describe, it, expect } from 'vitest';
import {
  getErrorMessage,
  isNetworkError,
  isPostgrestError,
  createErrorResponse,
  handleSupabaseError,
} from './errors';
import type { PostgrestError } from '@supabase/supabase-js';

describe('Error Utilities', () => {
  describe('getErrorMessage', () => {
    it('should return user-friendly message for known errors', () => {
      const error = new Error('Invalid login credentials');
      expect(getErrorMessage(error)).toBe('Invalid email or password. Please try again.');
    });

    it('should return original message for unknown errors', () => {
      const error = new Error('Some unknown error');
      expect(getErrorMessage(error)).toBe('Some unknown error');
    });

    it('should return fallback for null/undefined', () => {
      expect(getErrorMessage(null)).toBe('An unexpected error occurred');
      expect(getErrorMessage(undefined)).toBe('An unexpected error occurred');
      expect(getErrorMessage(null, 'Custom fallback')).toBe('Custom fallback');
    });

    it('should handle PostgrestError', () => {
      const error: PostgrestError = {
        message: 'permission denied',
        details: 'Some details',
        hint: 'Some hint',
        code: '42501',
      };
      expect(getErrorMessage(error)).toBe('You do not have permission to perform this action.');
    });

    it('should handle string errors', () => {
      expect(getErrorMessage('Failed to fetch')).toBe('Network error. Please check your internet connection.');
    });
  });

  describe('isNetworkError', () => {
    it('should identify network errors', () => {
      expect(isNetworkError(new Error('Failed to fetch'))).toBe(true);
      expect(isNetworkError(new Error('Network request failed'))).toBe(true);
      expect(isNetworkError(new Error('NetworkError'))).toBe(true);
    });

    it('should not identify non-network errors', () => {
      expect(isNetworkError(new Error('Some other error'))).toBe(false);
      expect(isNetworkError('string error')).toBe(false);
      expect(isNetworkError(null)).toBe(false);
    });
  });

  describe('isPostgrestError', () => {
    it('should identify PostgrestError', () => {
      const error: PostgrestError = {
        message: 'Error message',
        details: 'Details',
        hint: 'Hint',
        code: '42501',
      };
      expect(isPostgrestError(error)).toBe(true);
    });

    it('should not identify non-PostgrestError', () => {
      expect(isPostgrestError(new Error('Some error'))).toBe(false);
      expect(isPostgrestError({ message: 'Error' })).toBe(false);
      expect(isPostgrestError(null)).toBe(false);
    });
  });

  describe('createErrorResponse', () => {
    it('should create error response from Error object', () => {
      const error = new Error('Test error');
      const result = createErrorResponse(error);
      expect(result.error).toBe(error);
      expect(result.data).toBeUndefined();
    });

    it('should create error response from unknown error', () => {
      const result = createErrorResponse('String error');
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error.message).toBe('String error');
      expect(result.data).toBeUndefined();
    });

    it('should use fallback message', () => {
      const result = createErrorResponse(null, 'Custom fallback');
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error.message).toBe('Custom fallback');
    });
  });

  describe('handleSupabaseError', () => {
    it('should return data when no error', () => {
      const data = { id: '123', name: 'Test' };
      const result = handleSupabaseError(data, null);
      expect(result.data).toBe(data);
      expect(result.error).toBeNull();
    });

    it('should return error when Supabase error exists', () => {
      const error: PostgrestError = {
        message: 'permission denied',
        details: 'Details',
        hint: 'Hint',
        code: '42501',
      };
      const result = handleSupabaseError(null, error);
      expect(result.data).toBeNull();
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe('You do not have permission to perform this action.');
    });
  });
});
