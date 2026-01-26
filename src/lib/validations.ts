import { z } from 'zod';

// Base validation schemas
export const emailSchema = z.string().email('Please enter a valid email address');

export const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

export const fullNameSchema = z
  .string()
  .min(2, 'Full name must be at least 2 characters')
  .max(100, 'Name is too long');

export const phoneSchema = z
  .string()
  .max(20, 'Phone number is too long')
  .optional()
  .or(z.literal(''));

// Composite schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registerSchema = z
  .object({
    fullName: fullNameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const profileSchema = z.object({
  full_name: fullNameSchema,
  phone: phoneSchema,
});

export const passwordUpdateSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// Helper schema for optional email (allows empty string or valid email)
const optionalEmailSchema = z.preprocess(
  (val) => (val === null || val === undefined ? '' : val),
  z.union([z.string().email('Invalid email address'), z.literal('')])
);

// Helper schema for optional URL (allows empty string or valid URL)
const optionalUrlSchema = z.preprocess(
  (val) => (val === null || val === undefined ? '' : val),
  z.union([z.string().url('Invalid URL'), z.literal('')])
);

export const systemSettingsSchema = z.object({
  organization_name: z.string().min(1, 'Organization name is required').max(100),
  contact_email: optionalEmailSchema,
  contact_phone: phoneSchema,
  contact_address: z.string().max(500, 'Address is too long').optional().or(z.literal('')),
  timezone: z.string().min(1, 'Timezone is required'),
  date_format: z.enum(['MM/dd/yyyy', 'dd/MM/yyyy', 'yyyy-MM-dd'], {
    errorMap: () => ({ message: 'Invalid date format' }),
  }),
  time_format: z.enum(['12h', '24h']),
  logo_url: optionalUrlSchema,
  default_language: z.string().min(2).max(5),
  system_description: z.string().max(1000, 'Description is too long').optional().or(z.literal('')),
});

// Inventory validation schemas
export const equipmentCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100, 'Name is too long'),
  description: z.string().max(500, 'Description is too long').optional().or(z.literal('')),
});

export const locationSchema = z.object({
  name: z.string().min(1, 'Location name is required').max(100, 'Name is too long'),
  type: z.enum(['warehouse', 'job_site'], {
    errorMap: () => ({ message: 'Invalid location type' }),
  }),
  address: z.string().max(500, 'Address is too long').optional().or(z.literal('')),
  is_active: z.boolean(),
});

export const equipmentItemSchema = z.object({
  category_id: z.string().uuid('Invalid category'),
  name: z.string().min(1, 'Item name is required').max(200, 'Name is too long'),
  description: z.string().max(1000, 'Description is too long').optional().or(z.literal('')),
  code: z.string().max(50, 'Code is too long').optional().or(z.literal('')),
  quantity_total: z
    .number()
    .int('Quantity must be a whole number')
    .min(0, 'Quantity cannot be negative'),
  unit_cost: z
    .number()
    .nonnegative('Cost cannot be negative')
    .max(999999.99, 'Cost is too large')
    .optional()
    .nullable(),
  condition: z.enum(['good', 'fair', 'damaged', 'needs_repair', 'retired'], {
    errorMap: () => ({ message: 'Invalid condition' }),
  }),
  location_id: z.string().uuid('Invalid location').optional().nullable(),
  image_url: optionalUrlSchema,
  notes: z.string().max(2000, 'Notes are too long').optional().or(z.literal('')),
});

export const equipmentCheckoutSchema = z.object({
  equipment_id: z.string().uuid('Invalid equipment item'),
  quantity: z.number().int('Quantity must be a whole number').min(1, 'Quantity must be at least 1'),
  expected_return_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (use YYYY-MM-DD)')
    .optional()
    .nullable(),
  destination_location_id: z.string().uuid('Invalid location').optional().nullable(),
  notes: z.string().max(1000, 'Notes are too long').optional().or(z.literal('')),
});

export const equipmentCheckinSchema = z.object({
  checkout_id: z.string().uuid('Invalid checkout record'),
  notes: z.string().max(1000, 'Notes are too long').optional().or(z.literal('')),
});

export const equipmentMaintenanceSchema = z.object({
  equipment_id: z.string().uuid('Invalid equipment item'),
  maintenance_type: z.enum(['inspection', 'repair', 'replacement'], {
    errorMap: () => ({ message: 'Invalid maintenance type' }),
  }),
  next_scheduled_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (use YYYY-MM-DD)')
    .optional()
    .nullable(),
  notes: z.string().max(2000, 'Notes are too long').optional().or(z.literal('')),
  cost: z
    .number()
    .nonnegative('Cost cannot be negative')
    .max(999999.99, 'Cost is too large')
    .optional()
    .nullable(),
});

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type PasswordUpdateFormData = z.infer<typeof passwordUpdateSchema>;
export type SystemSettingsFormData = z.infer<typeof systemSettingsSchema>;
export type EquipmentCategoryFormData = z.infer<typeof equipmentCategorySchema>;
export type LocationFormData = z.infer<typeof locationSchema>;
export type EquipmentItemFormData = z.infer<typeof equipmentItemSchema>;
export type EquipmentCheckoutFormData = z.infer<typeof equipmentCheckoutSchema>;
export type EquipmentCheckinFormData = z.infer<typeof equipmentCheckinSchema>;
export type EquipmentMaintenanceFormData = z.infer<typeof equipmentMaintenanceSchema>;
