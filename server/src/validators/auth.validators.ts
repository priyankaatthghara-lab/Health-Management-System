import { z } from 'zod';

/**
 * Strong password pattern:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 */
const passwordValidation = z
  .string({ required_error: 'Password is required' })
  .min(8, 'Password must be at least 8 characters long')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  );

/**
 * Validation schema for Donor registration
 */
export const registerDonorSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters long')
    .max(100, 'Name cannot exceed 100 characters'),
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Please provide a valid email address')
    .toLowerCase(),
  password: passwordValidation,
  phone: z.string().trim().optional(),
  dateOfBirth: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  bloodGroup: z
    .enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .optional(),
  contactPreference: z
    .enum(['email', 'phone', 'both'], {
      errorMap: () => ({ message: 'Contact preference must be email, phone, or both' }),
    })
    .optional(),
  coordinates: z
    .object({
      type: z.literal('Point').default('Point'),
      coordinates: z
        .tuple([z.number(), z.number()])
        .refine(
          ([lng, lat]) => lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90,
          'Coordinates must be valid longitude (-180 to 180) and latitude (-90 to 90)'
        ),
    })
    .optional(),
  consentToContact: z.boolean().optional(),
  consentToLocationSharing: z.boolean().optional(),
});

/**
 * Validation schema for Hospital registration
 */
export const registerHospitalSchema = z.object({
  name: z
    .string({ required_error: 'Administrator/Contact name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters long')
    .max(100, 'Name cannot exceed 100 characters'),
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Please provide a valid email address')
    .toLowerCase(),
  password: passwordValidation,
  hospitalName: z
    .string({ required_error: 'Hospital name is required' })
    .trim()
    .min(2, 'Hospital name must be at least 2 characters long')
    .max(200, 'Hospital name cannot exceed 200 characters'),
  address: z
    .string({ required_error: 'Hospital address is required' })
    .trim()
    .min(3, 'Address must be at least 3 characters long'),
  city: z
    .string({ required_error: 'City is required' })
    .trim()
    .min(2, 'City must be at least 2 characters long'),
  state: z
    .string({ required_error: 'State is required' })
    .trim()
    .min(2, 'State must be at least 2 characters long'),
  phone: z
    .string({ required_error: 'Contact phone number is required' })
    .trim()
    .min(5, 'Phone number must be at least 5 digits'),
  type: z.enum(['government', 'private', 'nonprofit', 'blood_bank'], {
    errorMap: () => ({
      message: 'Hospital type must be government, private, nonprofit, or blood_bank',
    }),
  }),
  registrationNumber: z.string().trim().optional(),
  licenseNumber: z.string().trim().optional(),
  website: z.string().trim().url('Invalid website URL').optional().or(z.literal('')),
  operatingHours: z.string().trim().optional(),
  emergencyContact: z.string().trim().optional(),
  coordinates: z
    .object({
      type: z.literal('Point').default('Point'),
      coordinates: z
        .tuple([z.number(), z.number()])
        .refine(
          ([lng, lat]) => lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90,
          'Coordinates must be valid longitude (-180 to 180) and latitude (-90 to 90)'
        ),
    })
    .optional(),
});

/**
 * Validation schema for User login
 */
export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Please provide a valid email address')
    .toLowerCase(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password cannot be empty'),
});

/**
 * Validation schema for Forgot Password request
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Please provide a valid email address')
    .toLowerCase(),
});

/**
 * Validation schema for Password Reset execution
 */
export const resetPasswordSchema = z.object({
  token: z
    .string({ required_error: 'Reset token is required' })
    .trim()
    .min(1, 'Reset token cannot be empty'),
  password: passwordValidation,
});

export type RegisterDonorInput = z.infer<typeof registerDonorSchema>;
export type RegisterHospitalInput = z.infer<typeof registerHospitalSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
