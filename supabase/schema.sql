-- Initial Schema for Zone Guardian
-- This schema combines all initial migrations into a single file
-- It is idempotent and can be run multiple times safely

-- ============================================================================
-- Types
-- ============================================================================

-- Create user roles enum (idempotent)
DO $$ BEGIN
  CREATE TYPE public.user_roles AS ENUM ('tcm', 'sm', 'dc', 'fs', 'tws', 'tcp');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- Tables
-- ============================================================================

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  role public.user_roles NOT NULL DEFAULT 'tcp',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add table comment
COMMENT ON TABLE public.profiles IS 'User profiles linked to auth.users';

-- Add column comments
COMMENT ON COLUMN public.profiles.id IS 'References auth.users.id';
COMMENT ON COLUMN public.profiles.role IS 'User role: tcm (admin), sm, dc, fs, tws, tcp';

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create system_settings table (singleton pattern)
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
  organization_name TEXT NOT NULL DEFAULT 'Zone Guardian',
  contact_email TEXT,
  contact_phone TEXT,
  contact_address TEXT,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  date_format TEXT NOT NULL DEFAULT 'MM/dd/yyyy',
  time_format TEXT NOT NULL DEFAULT '12h',
  logo_url TEXT,
  default_language TEXT NOT NULL DEFAULT 'en',
  system_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT single_row CHECK (id = '00000000-0000-0000-0000-000000000000'::uuid)
);

-- Add table comment
COMMENT ON TABLE public.system_settings IS 'System-wide settings (singleton table)';

-- Insert default settings row (idempotent)
INSERT INTO public.system_settings (id, organization_name)
VALUES ('00000000-0000-0000-0000-000000000000'::uuid, 'Zone Guardian')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Indexes
-- ============================================================================

-- Index for email lookups
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email) WHERE email IS NOT NULL;

-- Index for role-based queries
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);

-- ============================================================================
-- Functions
-- ============================================================================

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_updated_at() IS 'Automatically updates the updated_at timestamp on row update';

-- Create function to check if user is TCM (admin)
CREATE OR REPLACE FUNCTION public.is_tcm(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = 'tcm'
  );
$$;

COMMENT ON FUNCTION public.is_tcm(UUID) IS 'Checks if a user has the TCM (admin) role';

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log error but don't fail the auth.users insert
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a profile when a new user signs up';

-- ============================================================================
-- Triggers
-- ============================================================================

-- Drop and recreate trigger for updated_at (idempotent)
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Drop and recreate trigger for new user signup (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Drop and recreate trigger for system_settings updated_at (idempotent)
DROP TRIGGER IF EXISTS system_settings_updated_at ON public.system_settings;
CREATE TRIGGER system_settings_updated_at
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- RLS Policies
-- ============================================================================

-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "TCM can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "TCM can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.profiles;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- TCM can view all profiles
CREATE POLICY "TCM can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (public.is_tcm(auth.uid()));

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- TCM can update any profile (including role)
CREATE POLICY "TCM can update any profile"
  ON public.profiles
  FOR UPDATE
  USING (public.is_tcm(auth.uid()))
  WITH CHECK (public.is_tcm(auth.uid()));

-- Allow insert for new users (via trigger)
CREATE POLICY "Allow insert for authenticated users"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- System Settings RLS Policies
-- ============================================================================

-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "TCM can view settings" ON public.system_settings;
DROP POLICY IF EXISTS "TCM can update settings" ON public.system_settings;
DROP POLICY IF EXISTS "TCM can insert settings" ON public.system_settings;

-- TCM can view settings
CREATE POLICY "TCM can view settings"
  ON public.system_settings
  FOR SELECT
  USING (public.is_tcm(auth.uid()));

-- TCM can insert settings
CREATE POLICY "TCM can insert settings"
  ON public.system_settings
  FOR INSERT
  WITH CHECK (public.is_tcm(auth.uid()));

-- TCM can update settings
CREATE POLICY "TCM can update settings"
  ON public.system_settings
  FOR UPDATE
  USING (public.is_tcm(auth.uid()))
  WITH CHECK (public.is_tcm(auth.uid()));
