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

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type PasswordUpdateFormData = z.infer<typeof passwordUpdateSchema>;
export type SystemSettingsFormData = z.infer<typeof systemSettingsSchema>;
