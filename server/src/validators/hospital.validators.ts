import { z } from 'zod';

export const bloodGroupEnum = z.enum([
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
]);

export const bloodComponentEnum = z.enum([
  'red_blood_cells',
  'platelets',
  'plasma',
  'whole_blood',
]);

export const urgencyEnum = z.enum(['routine', 'urgent', 'emergency']);

export const requestStatusEnum = z.enum([
  'draft',
  'submitted',
  'pending_review',
  'active',
  'donor_contacted',
  'coordination_in_progress',
  'fulfilled',
  'cancelled',
  'expired',
]);

export const coordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const updateHospitalSchema = z.object({
  name: z.string().trim().min(2, 'Hospital name must be at least 2 characters').max(200).optional(),
  address: z.string().trim().min(3, 'Address must be at least 3 characters').optional(),
  city: z.string().trim().min(2, 'City must be at least 2 characters').optional(),
  state: z.string().trim().min(2, 'State must be at least 2 characters').optional(),
  phone: z.string().trim().min(5, 'Phone number must be at least 5 digits').optional(),
  email: z.string().trim().email('Invalid email address').optional(),
  website: z.string().trim().url('Invalid website URL').or(z.literal('')).optional(),
  operatingHours: z.string().trim().optional(),
  emergencyContact: z.string().trim().optional(),
  type: z.enum(['government', 'private', 'nonprofit', 'blood_bank']).optional(),
  coordinates: coordinatesSchema.optional(),
});

export const createBloodRequestSchema = z.object({
  patientRef: z
    .string()
    .trim()
    .min(1, 'Patient reference ID or identifier is required')
    .max(100, 'Patient reference cannot exceed 100 characters'),
  bloodGroup: bloodGroupEnum,
  component: bloodComponentEnum,
  unitsRequired: z
    .number({ invalid_type_error: 'Units required must be a number' })
    .int('Units must be an integer')
    .min(1, 'At least 1 unit must be requested')
    .max(50, 'Cannot request more than 50 units in a single order'),
  urgency: urgencyEnum,
  requiredBy: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid required-by date format',
    })
    .refine((val) => new Date(val).getTime() > Date.now(), {
      message: 'Required-by date must be set in the future',
    }),
  contactPerson: z
    .string()
    .trim()
    .min(1, 'Contact person name is required')
    .max(100),
  contactPhone: z
    .string()
    .trim()
    .min(5, 'Valid contact phone number is required')
    .max(25),
  notes: z.string().trim().max(1000).optional(),
  location: z
    .object({
      address: z.string().trim().optional(),
      city: z.string().trim().optional(),
      state: z.string().trim().optional(),
      coordinates: coordinatesSchema.optional(),
    })
    .optional(),
});

export const updateBloodRequestSchema = z.object({
  patientRef: z.string().trim().min(1).max(100).optional(),
  bloodGroup: bloodGroupEnum.optional(),
  component: bloodComponentEnum.optional(),
  unitsRequired: z.number().int().min(1).max(50).optional(),
  unitsFulfilled: z.number().int().min(0).max(50).optional(),
  urgency: urgencyEnum.optional(),
  requiredBy: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid date format',
    })
    .optional(),
  contactPerson: z.string().trim().min(1).optional(),
  contactPhone: z.string().trim().min(5).optional(),
  notes: z.string().trim().max(1000).optional(),
  status: requestStatusEnum.optional(),
  location: z
    .object({
      address: z.string().trim().optional(),
      city: z.string().trim().optional(),
      state: z.string().trim().optional(),
      coordinates: coordinatesSchema.optional(),
    })
    .optional(),
});

export const cancelRequestSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(5, 'Cancellation reason must be at least 5 characters long')
    .max(500, 'Reason cannot exceed 500 characters'),
});

export type UpdateHospitalInput = z.infer<typeof updateHospitalSchema>;
export type CreateBloodRequestInput = z.infer<typeof createBloodRequestSchema>;
export type UpdateBloodRequestInput = z.infer<typeof updateBloodRequestSchema>;
export type CancelRequestInput = z.infer<typeof cancelRequestSchema>;
