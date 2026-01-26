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

-- ============================================================================
-- Inventory System Types
-- ============================================================================

-- Create equipment condition enum (idempotent)
DO $$ BEGIN
  CREATE TYPE public.equipment_condition AS ENUM ('good', 'fair', 'damaged', 'needs_repair', 'retired');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create location type enum (idempotent)
DO $$ BEGIN
  CREATE TYPE public.location_type AS ENUM ('warehouse', 'job_site');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create maintenance type enum (idempotent)
DO $$ BEGIN
  CREATE TYPE public.maintenance_type AS ENUM ('inspection', 'repair', 'replacement');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- Inventory System Tables
-- ============================================================================

-- Create equipment_categories table
CREATE TABLE IF NOT EXISTS public.equipment_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.equipment_categories IS 'Equipment type classification for inventory items';

-- Create locations table
CREATE TABLE IF NOT EXISTS public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type public.location_type NOT NULL,
  address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.locations IS 'Warehouses and job sites where equipment is stored or deployed';

-- Create equipment_items table
CREATE TABLE IF NOT EXISTS public.equipment_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.equipment_categories(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  description TEXT,
  code TEXT UNIQUE,
  quantity_total INTEGER NOT NULL DEFAULT 0 CHECK (quantity_total >= 0),
  quantity_available INTEGER NOT NULL DEFAULT 0 CHECK (quantity_available >= 0),
  unit_cost DECIMAL(10, 2),
  condition public.equipment_condition NOT NULL DEFAULT 'good',
  location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  image_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT quantity_available_check CHECK (quantity_available <= quantity_total)
);

COMMENT ON TABLE public.equipment_items IS 'Individual equipment records in the inventory system';

-- Create equipment_checkouts table
CREATE TABLE IF NOT EXISTS public.equipment_checkouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID NOT NULL REFERENCES public.equipment_items(id) ON DELETE RESTRICT,
  checked_out_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  checked_out_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expected_return_date DATE,
  checked_in_at TIMESTAMPTZ,
  checked_in_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  destination_location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  notes TEXT
);

COMMENT ON TABLE public.equipment_checkouts IS 'Check-in/check-out tracking for equipment items';

-- Create equipment_maintenance table
CREATE TABLE IF NOT EXISTS public.equipment_maintenance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID NOT NULL REFERENCES public.equipment_items(id) ON DELETE RESTRICT,
  maintenance_type public.maintenance_type NOT NULL,
  performed_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  performed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  next_scheduled_date DATE,
  notes TEXT,
  cost DECIMAL(10, 2)
);

COMMENT ON TABLE public.equipment_maintenance IS 'Maintenance and inspection history for equipment items';

-- ============================================================================
-- Inventory System Indexes
-- ============================================================================

-- Indexes for equipment_categories
CREATE INDEX IF NOT EXISTS equipment_categories_name_idx ON public.equipment_categories(name);

-- Indexes for locations
CREATE INDEX IF NOT EXISTS locations_type_idx ON public.locations(type);
CREATE INDEX IF NOT EXISTS locations_is_active_idx ON public.locations(is_active);

-- Indexes for equipment_items
CREATE INDEX IF NOT EXISTS equipment_items_category_id_idx ON public.equipment_items(category_id);
CREATE INDEX IF NOT EXISTS equipment_items_location_id_idx ON public.equipment_items(location_id);
CREATE INDEX IF NOT EXISTS equipment_items_condition_idx ON public.equipment_items(condition);
CREATE INDEX IF NOT EXISTS equipment_items_code_idx ON public.equipment_items(code) WHERE code IS NOT NULL;

-- Indexes for equipment_checkouts
CREATE INDEX IF NOT EXISTS equipment_checkouts_equipment_id_idx ON public.equipment_checkouts(equipment_id);
CREATE INDEX IF NOT EXISTS equipment_checkouts_checked_out_by_idx ON public.equipment_checkouts(checked_out_by);
CREATE INDEX IF NOT EXISTS equipment_checkouts_checked_in_at_idx ON public.equipment_checkouts(checked_in_at) WHERE checked_in_at IS NULL;
CREATE INDEX IF NOT EXISTS equipment_checkouts_checked_out_at_idx ON public.equipment_checkouts(checked_out_at);

-- Indexes for equipment_maintenance
CREATE INDEX IF NOT EXISTS equipment_maintenance_equipment_id_idx ON public.equipment_maintenance(equipment_id);
CREATE INDEX IF NOT EXISTS equipment_maintenance_performed_by_idx ON public.equipment_maintenance(performed_by);
CREATE INDEX IF NOT EXISTS equipment_maintenance_next_scheduled_date_idx ON public.equipment_maintenance(next_scheduled_date) WHERE next_scheduled_date IS NOT NULL;

-- ============================================================================
-- Inventory System Functions
-- ============================================================================

-- Create function to check if user can manage inventory (TCM, SM, DC, FS)
CREATE OR REPLACE FUNCTION public.can_manage_inventory(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role IN ('tcm', 'sm', 'dc', 'fs')
  );
$$;

COMMENT ON FUNCTION public.can_manage_inventory(UUID) IS 'Checks if a user can manage inventory (TCM, SM, DC, FS roles)';

-- Create function to check if user can checkout equipment (TCM, SM, DC, FS, TWS)
CREATE OR REPLACE FUNCTION public.can_checkout_equipment(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role IN ('tcm', 'sm', 'dc', 'fs', 'tws')
  );
$$;

COMMENT ON FUNCTION public.can_checkout_equipment(UUID) IS 'Checks if a user can checkout equipment (TCM, SM, DC, FS, TWS roles)';

-- ============================================================================
-- Inventory System Triggers
-- ============================================================================

-- Triggers for updated_at on inventory tables
DROP TRIGGER IF EXISTS equipment_categories_updated_at ON public.equipment_categories;
CREATE TRIGGER equipment_categories_updated_at
  BEFORE UPDATE ON public.equipment_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS locations_updated_at ON public.locations;
CREATE TRIGGER locations_updated_at
  BEFORE UPDATE ON public.locations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS equipment_items_updated_at ON public.equipment_items;
CREATE TRIGGER equipment_items_updated_at
  BEFORE UPDATE ON public.equipment_items
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- Inventory System RLS Policies
-- ============================================================================

-- Enable RLS on all inventory tables
ALTER TABLE public.equipment_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_checkouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_maintenance ENABLE ROW LEVEL SECURITY;

-- Equipment Categories RLS Policies
DROP POLICY IF EXISTS "All authenticated users can view categories" ON public.equipment_categories;
DROP POLICY IF EXISTS "Managers can insert categories" ON public.equipment_categories;
DROP POLICY IF EXISTS "Managers can update categories" ON public.equipment_categories;
DROP POLICY IF EXISTS "Managers can delete categories" ON public.equipment_categories;

CREATE POLICY "All authenticated users can view categories"
  ON public.equipment_categories
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Managers can insert categories"
  ON public.equipment_categories
  FOR INSERT
  WITH CHECK (public.can_manage_inventory(auth.uid()));

CREATE POLICY "Managers can update categories"
  ON public.equipment_categories
  FOR UPDATE
  USING (public.can_manage_inventory(auth.uid()))
  WITH CHECK (public.can_manage_inventory(auth.uid()));

CREATE POLICY "Managers can delete categories"
  ON public.equipment_categories
  FOR DELETE
  USING (public.can_manage_inventory(auth.uid()));

-- Locations RLS Policies
DROP POLICY IF EXISTS "All authenticated users can view locations" ON public.locations;
DROP POLICY IF EXISTS "Managers can insert locations" ON public.locations;
DROP POLICY IF EXISTS "Managers can update locations" ON public.locations;
DROP POLICY IF EXISTS "Managers can delete locations" ON public.locations;

CREATE POLICY "All authenticated users can view locations"
  ON public.locations
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Managers can insert locations"
  ON public.locations
  FOR INSERT
  WITH CHECK (public.can_manage_inventory(auth.uid()));

CREATE POLICY "Managers can update locations"
  ON public.locations
  FOR UPDATE
  USING (public.can_manage_inventory(auth.uid()))
  WITH CHECK (public.can_manage_inventory(auth.uid()));

CREATE POLICY "Managers can delete locations"
  ON public.locations
  FOR DELETE
  USING (public.can_manage_inventory(auth.uid()));

-- Equipment Items RLS Policies
DROP POLICY IF EXISTS "All authenticated users can view items" ON public.equipment_items;
DROP POLICY IF EXISTS "Managers can insert items" ON public.equipment_items;
DROP POLICY IF EXISTS "Managers can update items" ON public.equipment_items;
DROP POLICY IF EXISTS "Managers can delete items" ON public.equipment_items;

CREATE POLICY "All authenticated users can view items"
  ON public.equipment_items
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Managers can insert items"
  ON public.equipment_items
  FOR INSERT
  WITH CHECK (public.can_manage_inventory(auth.uid()));

CREATE POLICY "Managers can update items"
  ON public.equipment_items
  FOR UPDATE
  USING (public.can_manage_inventory(auth.uid()))
  WITH CHECK (public.can_manage_inventory(auth.uid()));

CREATE POLICY "Managers can delete items"
  ON public.equipment_items
  FOR DELETE
  USING (public.can_manage_inventory(auth.uid()));

-- Equipment Checkouts RLS Policies
DROP POLICY IF EXISTS "All authenticated users can view checkouts" ON public.equipment_checkouts;
DROP POLICY IF EXISTS "Authorized users can checkout equipment" ON public.equipment_checkouts;
DROP POLICY IF EXISTS "Authorized users can update checkouts" ON public.equipment_checkouts;
DROP POLICY IF EXISTS "Managers can delete checkouts" ON public.equipment_checkouts;

CREATE POLICY "All authenticated users can view checkouts"
  ON public.equipment_checkouts
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authorized users can checkout equipment"
  ON public.equipment_checkouts
  FOR INSERT
  WITH CHECK (public.can_checkout_equipment(auth.uid()));

CREATE POLICY "Authorized users can update checkouts"
  ON public.equipment_checkouts
  FOR UPDATE
  USING (public.can_checkout_equipment(auth.uid()))
  WITH CHECK (public.can_checkout_equipment(auth.uid()));

CREATE POLICY "Managers can delete checkouts"
  ON public.equipment_checkouts
  FOR DELETE
  USING (public.can_manage_inventory(auth.uid()));

-- Equipment Maintenance RLS Policies
DROP POLICY IF EXISTS "All authenticated users can view maintenance" ON public.equipment_maintenance;
DROP POLICY IF EXISTS "Managers can insert maintenance" ON public.equipment_maintenance;
DROP POLICY IF EXISTS "Managers can update maintenance" ON public.equipment_maintenance;
DROP POLICY IF EXISTS "Managers can delete maintenance" ON public.equipment_maintenance;

CREATE POLICY "All authenticated users can view maintenance"
  ON public.equipment_maintenance
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Managers can insert maintenance"
  ON public.equipment_maintenance
  FOR INSERT
  WITH CHECK (public.can_manage_inventory(auth.uid()));

CREATE POLICY "Managers can update maintenance"
  ON public.equipment_maintenance
  FOR UPDATE
  USING (public.can_manage_inventory(auth.uid()))
  WITH CHECK (public.can_manage_inventory(auth.uid()));

CREATE POLICY "Managers can delete maintenance"
  ON public.equipment_maintenance
  FOR DELETE
  USING (public.can_manage_inventory(auth.uid()));
