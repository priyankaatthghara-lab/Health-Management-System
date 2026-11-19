import { z } from 'zod';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
const contactPreferences = ['email', 'phone', 'both'] as const;
const availabilityStatuses = ['available', 'temporarily_unavailable', 'unavailable'] as const;
const matchResponses = ['accepted', 'declined', 'maybe_later'] as const;

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long').max(100).optional(),
  phone: z
    .string()
    .trim()
    .regex(/^[+0-9\s\-()]{7,20}$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
  dateOfBirth: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
    .or(z.date())
    .optional(),
  bloodGroup: z.enum(bloodGroups, {
    errorMap: () => ({ message: 'Please select a valid blood group' }),
  }).optional(),
  city: z.string().trim().min(2, 'City must be at least 2 characters').max(100).optional(),
  state: z.string().trim().min(2, 'State must be at least 2 characters').max(100).optional(),
  contactPreference: z.enum(contactPreferences, {
    errorMap: () => ({ message: 'Invalid contact preference' }),
  }).optional(),
  coordinates: z
    .object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    })
    .optional(),
  consentToContact: z.boolean().optional(),
  consentToLocationSharing: z.boolean().optional(),
});

export const updateAvailabilitySchema = z.object({
  availability: z.enum(availabilityStatuses, {
    errorMap: () => ({ message: 'Invalid availability status' }),
  }),
  availableUntil: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}/))
    .or(z.date())
    .nullable()
    .optional(),
});

export const updateHealthInfoSchema = z.object({
  weight: z
    .number()
    .min(30, 'Weight must be at least 30 kg')
    .max(300, 'Weight must be under 300 kg')
    .optional(),
  hasChronicConditions: z.boolean().optional(),
  conditions: z.array(z.string().trim().max(100)).optional(),
  medications: z.array(z.string().trim().max(100)).optional(),
});

export const respondToMatchSchema = z.object({
  response: z.enum(matchResponses, {
    errorMap: () => ({ message: 'Response must be accepted, declined, or maybe_later' }),
  }),
  message: z.string().trim().max(500, 'Message cannot exceed 500 characters').optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateAvailabilityInput = z.infer<typeof updateAvailabilitySchema>;
export type UpdateHealthInfoInput = z.infer<typeof updateHealthInfoSchema>;
export type RespondToMatchInput = z.infer<typeof respondToMatchSchema>;
