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
   * Fetches system settings (singleton)
   */
  async get(): Promise<{ data: SystemSettings | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .eq('id', '00000000-0000-0000-0000-000000000000')
      .maybeSingle();

    return handleSupabaseError(data as SystemSettings | null, error);
  },

  /**
   * Updates system settings
   */
  async update(
    updates: Partial<Omit<SystemSettings, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<{ data: SystemSettings | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('system_settings')
      .update(updates)
      .eq('id', '00000000-0000-0000-0000-000000000000')
      .select()
      .single();

    return handleSupabaseError(data as SystemSettings | null, error);
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
