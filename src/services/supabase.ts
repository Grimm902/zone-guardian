import { supabase } from '@/integrations/supabase/client';
import { handleSupabaseError } from '@/lib/errors';
import type { Profile, UserRole } from '@/types/auth';
import type { SystemSettings } from '@/types/settings';
import type { Database, Tables } from '@/integrations/supabase/types';

/**
 * Profile service
 * Handles all profile-related database operations
 */
export const profileService = {
  /**
   * Fetches a profile by user ID
   */
  async getById(userId: string): Promise<{ data: Profile | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    return handleSupabaseError(data as Profile | null, error);
  },

  /**
   * Fetches all profiles (TCM only)
   */
  async getAll(): Promise<{ data: Profile[] | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    return handleSupabaseError(data as Profile[] | null, error);
  },

  /**
   * Updates a profile
   */
  async update(
    userId: string,
    updates: Partial<Pick<Profile, 'full_name' | 'phone' | 'role'>>
  ): Promise<{ data: Profile | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    return handleSupabaseError(data as Profile | null, error);
  },

  /**
   * Updates a user's role (TCM only)
   */
  async updateRole(
    userId: string,
    role: UserRole
  ): Promise<{ data: Profile | null; error: Error | null }> {
    return this.update(userId, { role });
  },
};

/**
 * System settings service
 * Handles all system settings operations (TCM only)
 */
export const settingsService = {
  /**
   * Creates/initializes system settings with default values
   */
  async create(): Promise<{ data: SystemSettings | null; error: Error | null }> {
    const defaultSettings = {
      id: '00000000-0000-0000-0000-000000000000',
      organization_name: 'Zone Guardian',
      contact_email: null,
      contact_phone: null,
      contact_address: null,
      timezone: 'UTC',
      date_format: 'MM/dd/yyyy',
      time_format: '12h' as const,
      logo_url: null,
      default_language: 'en',
      system_description: null,
    };

    const { data, error } = await supabase
      .from('system_settings')
      .insert(defaultSettings)
      .select()
      .single();

    if (error) {
      // Check if it's a duplicate key error (row already exists)
      if (error.code === '23505' || error.message?.includes('duplicate key')) {
        // Row was created by another request, try to fetch it
        return this.get();
      }

      // Check if it's an RLS policy error
      if (
        error.message?.includes('row-level security') ||
        error.message?.includes('permission denied') ||
        error.code === '42501' ||
        error.code === 'PGRST301'
      ) {
        return {
          data: null,
          error: new Error(
            'You do not have permission to create system settings. Only Traffic Control Managers (TCM) can initialize settings.'
          ),
        };
      }

      return handleSupabaseError(null, error);
    }

    return { data: data as SystemSettings, error: null };
  },

  /**
   * Fetches system settings (singleton)
   */
  async get(): Promise<{ data: SystemSettings | null; error: Error | null }> {
    // First, try to check if we can access the settings at all
    // This helps distinguish between RLS blocking and missing data
    const { data: checkData, error: checkError } = await supabase
      .from('system_settings')
      .select('id')
      .eq('id', '00000000-0000-0000-0000-000000000000')
      .maybeSingle();

    // If there's an error, it's likely an RLS policy issue
    if (checkError) {
      // Check if it's an RLS policy error
      if (
        checkError.message?.includes('row-level security') ||
        checkError.message?.includes('permission denied') ||
        checkError.code === '42501' ||
        checkError.code === 'PGRST301'
      ) {
        return {
          data: null,
          error: new Error(
            'You do not have permission to view system settings. Only Traffic Control Managers (TCM) can access settings.'
          ),
        };
      }
      return handleSupabaseError(null, checkError);
    }

    // If checkData is null but no error, the row might not exist
    // But we should still try to fetch the full data in case the select was blocked
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .eq('id', '00000000-0000-0000-0000-000000000000')
      .maybeSingle();

    if (error) {
      // Check if it's an RLS policy error
      if (
        error.message?.includes('row-level security') ||
        error.message?.includes('permission denied') ||
        error.code === '42501' ||
        error.code === 'PGRST301'
      ) {
        return {
          data: null,
          error: new Error(
            'You do not have permission to view system settings. Only Traffic Control Managers (TCM) can access settings.'
          ),
        };
      }
      return handleSupabaseError(null, error);
    }

    // If we got past the check but data is null, the row doesn't exist
    // Try to create it with default values
    if (!data && !checkData) {
      // Attempt to create default settings
      const createResult = await this.create();
      if (createResult.error) {
        // If creation fails, return the error
        return createResult;
      }
      // Return the newly created settings
      return createResult;
    }

    // If checkData exists but full data is null, it's likely an RLS issue on specific columns
    if (!data && checkData) {
      return {
        data: null,
        error: new Error(
          'You do not have permission to view system settings. Only Traffic Control Managers (TCM) can access settings.'
        ),
      };
    }

    return { data: data as SystemSettings, error: null };
  },

  /**
   * Updates system settings
   */
  async update(
    updates: Partial<Omit<SystemSettings, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<{ data: SystemSettings | null; error: Error | null }> {
    // First, verify we can access the settings (check RLS permissions)
    const { data: existingSettings, error: readError } = await supabase
      .from('system_settings')
      .select('id')
      .eq('id', '00000000-0000-0000-0000-000000000000')
      .maybeSingle();

    if (readError) {
      return handleSupabaseError(null, readError);
    }

    if (!existingSettings) {
      return {
        data: null,
        error: new Error(
          'System settings not found. You may not have permission to access settings, or the settings row does not exist.'
        ),
      };
    }

    // Perform the update
    const { data, error } = await supabase
      .from('system_settings')
      .update(updates)
      .eq('id', '00000000-0000-0000-0000-000000000000')
      .select()
      .maybeSingle();

    if (error) {
      // Check if it's an RLS policy error
      if (
        error.message?.includes('row-level security') ||
        error.message?.includes('permission denied') ||
        error.code === '42501'
      ) {
        return {
          data: null,
          error: new Error(
            'You do not have permission to update system settings. Only Traffic Control Managers (TCM) can modify settings.'
          ),
        };
      }
      return handleSupabaseError(null, error);
    }

    // If no data returned, the update didn't affect any rows (shouldn't happen, but handle it)
    if (!data) {
      return {
        data: null,
        error: new Error(
          'Failed to update system settings. The update did not affect any rows. You may not have permission to update settings.'
        ),
      };
    }

    return { data: data as SystemSettings, error: null };
  },
};

/**
 * Generic service utilities
 */
export const serviceUtils = {
  /**
   * Generic fetch all helper
   */
  async fetchAll<T extends keyof Database['public']['Tables']>(
    table: T
  ): Promise<{ data: Tables<T>[] | null; error: Error | null }> {
    const { data, error } = await supabase.from(table).select('*');

    return handleSupabaseError(data as Tables<T>[] | null, error);
  },

  /**
   * Generic fetch by ID helper
   */
  async fetchById<T extends keyof Database['public']['Tables']>(
    table: T,
    id: string
  ): Promise<{ data: Tables<T> | null; error: Error | null }> {
    const { data, error } = await supabase.from(table).select('*').eq('id', id).maybeSingle();

    return handleSupabaseError(data as Tables<T> | null, error);
  },

  /**
   * Generic create helper
   */
  async create<T extends keyof Database['public']['Tables']>(
    table: T,
    values: Database['public']['Tables'][T]['Insert']
  ): Promise<{ data: Tables<T> | null; error: Error | null }> {
    const { data, error } = await supabase.from(table).insert(values).select().single();

    return handleSupabaseError(data as Tables<T> | null, error);
  },

  /**
   * Generic update helper
   */
  async update<T extends keyof Database['public']['Tables']>(
    table: T,
    id: string,
    values: Database['public']['Tables'][T]['Update']
  ): Promise<{ data: Tables<T> | null; error: Error | null }> {
    const { data, error } = await supabase
      .from(table)
      .update(values)
      .eq('id', id)
      .select()
      .single();

    return handleSupabaseError(data as Tables<T> | null, error);
  },

  /**
   * Generic delete helper
   */
  async delete<T extends keyof Database['public']['Tables']>(
    table: T,
    id: string
  ): Promise<{ error: Error | null }> {
    const { error } = await supabase.from(table).delete().eq('id', id);

    return { error: error ? new Error(error.message) : null };
  },
};
