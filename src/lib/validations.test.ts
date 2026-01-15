import { describe, it, expect } from 'vitest';
import {
  emailSchema,
  passwordSchema,
  fullNameSchema,
  phoneSchema,
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  profileSchema,
  passwordUpdateSchema,
} from './validations';

describe('Validation Schemas', () => {
  describe('emailSchema', () => {
    it('should accept valid email addresses', () => {
      expect(emailSchema.safeParse('test@example.com').success).toBe(true);
      expect(emailSchema.safeParse('user.name@domain.co.uk').success).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(emailSchema.safeParse('invalid').success).toBe(false);
      expect(emailSchema.safeParse('invalid@').success).toBe(false);
      expect(emailSchema.safeParse('@domain.com').success).toBe(false);
      expect(emailSchema.safeParse('').success).toBe(false);
    });
  });

  describe('passwordSchema', () => {
    it('should accept passwords with at least 6 characters', () => {
      expect(passwordSchema.safeParse('123456').success).toBe(true);
      expect(passwordSchema.safeParse('password123').success).toBe(true);
    });

    it('should reject passwords shorter than 6 characters', () => {
      expect(passwordSchema.safeParse('12345').success).toBe(false);
      expect(passwordSchema.safeParse('').success).toBe(false);
    });
  });

  describe('fullNameSchema', () => {
    it('should accept valid names', () => {
      expect(fullNameSchema.safeParse('John Doe').success).toBe(true);
      expect(fullNameSchema.safeParse('Jane').success).toBe(true);
    });

    it('should reject names shorter than 2 characters', () => {
      expect(fullNameSchema.safeParse('J').success).toBe(false);
      expect(fullNameSchema.safeParse('').success).toBe(false);
    });

    it('should reject names longer than 100 characters', () => {
      const longName = 'a'.repeat(101);
      expect(fullNameSchema.safeParse(longName).success).toBe(false);
    });
  });

  describe('phoneSchema', () => {
    it('should accept valid phone numbers', () => {
      expect(phoneSchema.safeParse('1234567890').success).toBe(true);
      expect(phoneSchema.safeParse('+1-555-123-4567').success).toBe(true);
      expect(phoneSchema.safeParse('').success).toBe(true);
    });

    it('should accept undefined', () => {
      expect(phoneSchema.safeParse(undefined).success).toBe(true);
    });

    it('should reject phone numbers longer than 20 characters', () => {
      const longPhone = '1'.repeat(21);
      expect(phoneSchema.safeParse(longPhone).success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('should accept valid login data', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = loginSchema.safeParse({
        email: 'invalid',
        password: 'password123',
      });
      expect(result.success).toBe(false);
    });

    it('should reject short password', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: '12345',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('registerSchema', () => {
    it('should accept valid registration data with matching passwords', () => {
      const result = registerSchema.safeParse({
        fullName: 'John Doe',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject non-matching passwords', () => {
      const result = registerSchema.safeParse({
        fullName: 'John Doe',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'different123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('confirmPassword');
      }
    });

    it('should reject invalid email', () => {
      const result = registerSchema.safeParse({
        fullName: 'John Doe',
        email: 'invalid',
        password: 'password123',
        confirmPassword: 'password123',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('forgotPasswordSchema', () => {
    it('should accept valid email', () => {
      const result = forgotPasswordSchema.safeParse({
        email: 'test@example.com',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = forgotPasswordSchema.safeParse({
        email: 'invalid',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('resetPasswordSchema', () => {
    it('should accept valid password reset data with matching passwords', () => {
      const result = resetPasswordSchema.safeParse({
        password: 'newpassword123',
        confirmPassword: 'newpassword123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject non-matching passwords', () => {
      const result = resetPasswordSchema.safeParse({
        password: 'newpassword123',
        confirmPassword: 'different123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('confirmPassword');
      }
    });

    it('should reject short password', () => {
      const result = resetPasswordSchema.safeParse({
        password: '12345',
        confirmPassword: '12345',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('profileSchema', () => {
    it('should accept valid profile data', () => {
      const result = profileSchema.safeParse({
        full_name: 'John Doe',
        phone: '1234567890',
      });
      expect(result.success).toBe(true);
    });

    it('should accept empty phone', () => {
      const result = profileSchema.safeParse({
        full_name: 'John Doe',
        phone: '',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid name', () => {
      const result = profileSchema.safeParse({
        full_name: 'J',
        phone: '1234567890',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('passwordUpdateSchema', () => {
    it('should accept valid password update data with matching passwords', () => {
      const result = passwordUpdateSchema.safeParse({
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject non-matching passwords', () => {
      const result = passwordUpdateSchema.safeParse({
        newPassword: 'newpassword123',
        confirmPassword: 'different123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('confirmPassword');
      }
    });
  });
});
