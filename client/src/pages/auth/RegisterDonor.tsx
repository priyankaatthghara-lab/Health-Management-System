import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import {
  Heart,
  User,
  Mail,
  Phone,
  Lock,
  Calendar,
  MapPin,
  Building2,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  ArrowRight,
  Droplet,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Input, Button, GlassCard, Select } from '@/components/ui';
import { BloodGroup, ContactPreference } from '@/types';

// Zod schema with strict clinical validation rules
const donorRegistrationSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().min(1, 'Email is required').email('Please provide a valid email address'),
    phone: z
      .string()
      .min(10, 'Phone number must have at least 10 digits')
      .regex(/^[0-9+\-\s()]+$/, 'Please enter a valid phone number'),
    dob: z.string().refine((val) => {
      if (!val) return false;
      const date = new Date(val);
      const today = new Date();
      const age = today.getFullYear() - date.getFullYear();
      return age >= 18;
    }, 'Donors must be at least 18 years of age to participate'),
    bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], {
      required_error: 'Please select your blood group',
    }),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    contactPreference: z.enum(['email', 'phone', 'sms', 'whatsapp']),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
      .regex(/[a-z]/, 'Password must include at least one lowercase letter')
      .regex(/[0-9]/, 'Password must include at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    consent: z.literal(true, {
      errorMap: () => ({ message: 'You must consent to healthcare data handling and alerts' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type DonorRegistrationFormData = z.infer<typeof donorRegistrationSchema>;

const bloodGroupOptions = [
  { value: 'A+', label: 'A+ (A Positive)' },
  { value: 'A-', label: 'A- (A Negative)' },
  { value: 'B+', label: 'B+ (B Positive)' },
  { value: 'B-', label: 'B- (B Negative)' },
  { value: 'AB+', label: 'AB+ (AB Positive)' },
  { value: 'AB-', label: 'AB- (AB Negative)' },
  { value: 'O+', label: 'O+ (O Positive - Universal RBC)' },
  { value: 'O-', label: 'O- (O Negative - Universal Donor)' },
];

const contactOptions = [
  { value: 'phone', label: 'Phone Call (Recommended for Emergencies)' },
  { value: 'sms', label: 'SMS Notification' },
  { value: 'whatsapp', label: 'WhatsApp Alert' },
  { value: 'email', label: 'Email Digest' },
];

export const RegisterDonor: React.FC = () => {
  const { registerDonor } = useAuth();
  const navigate = useNavigate();

  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<DonorRegistrationFormData>({
    resolver: zodResolver(donorRegistrationSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      dob: '',
      bloodGroup: 'O+',
      city: '',
      state: '',
      contactPreference: 'phone',
      password: '',
      confirmPassword: '',
      consent: false as unknown as true,
    },
  });

  const passwordVal = watch('password') || '';

  // Password strength calculator
  const passwordStrength = useMemo(() => {
    if (!passwordVal) return { score: 0, label: 'None', color: 'bg-gray-200' };
    let score = 0;
    if (passwordVal.length >= 8) score += 1;
    if (/[A-Z]/.test(passwordVal)) score += 1;
    if (/[a-z]/.test(passwordVal)) score += 1;
    if (/[0-9]/.test(passwordVal)) score += 1;
    if (/[^A-Za-z0-9]/.test(passwordVal)) score += 1;

    if (score <= 2) return { score, label: 'Weak', color: 'bg-crimson-500' };
    if (score <= 4) return { score, label: 'Medium', color: 'bg-amber-500' };
    return { score, label: 'Strong', color: 'bg-emerald-500' };
  }, [passwordVal]);

  const onSubmit = async (data: DonorRegistrationFormData) => {
    try {
      setAuthError(null);
      setIsSubmitting(true);

      const payload = {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        phone: data.phone.trim(),
        dob: data.dob,
        bloodGroup: data.bloodGroup as BloodGroup,
        city: data.city.trim(),
        state: data.state.trim(),
        contactPreference: data.contactPreference as ContactPreference,
        // Default coordinates if geocoding is performed asynchronously on server
        coordinates: {
          lat: 28.6139,
          lng: 77.209,
        },
      };

      await registerDonor(payload);
      navigate('/donor/dashboard', { replace: true });
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string; error?: string } }; message?: string };
      const errorMessage =
        errorObj.response?.data?.message ||
        errorObj.response?.data?.error ||
        errorObj.message ||
        'Registration failed. Please check your information and try again.';
      setAuthError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden bg-gradient-to-br from-warm-bg via-rose-50/20 to-burgundy-50/30">
      {/* Decorative ambient background glows */}
      <div className="absolute top-10 right-10 w-80 h-80 bg-burgundy-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-rose-200/25 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-2xl relative z-10 my-6"
      >
        <GlassCard glow className="p-8 sm:p-10 border border-white/60">
          {/* Header Branding */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2.5 group mb-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-burgundy-700 via-burgundy-600 to-crimson-600 flex items-center justify-center text-white shadow-md shadow-burgundy-900/20 group-hover:scale-105 transition-transform duration-200">
                <Heart className="w-6 h-6 fill-white/20 stroke-white stroke-[2.2]" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-burgundy-950">
                LifeLink <span className="text-crimson-600">AI</span>
              </span>
            </Link>

            <h1 className="text-2xl font-bold text-primary-text tracking-tight">
              Register as a Blood Donor
            </h1>
            <p className="text-xs text-secondary-text mt-1 max-w-md mx-auto">
              Join the smart healthcare network. Receive urgent local transfusion alerts and help save lives in critical situations.
            </p>
          </div>

          {/* Preliminary Clinical Notice */}
          <div className="mb-6 p-3.5 rounded-2xl bg-burgundy-50/80 border border-burgundy-200/70 text-xs text-burgundy-900 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-burgundy-700 shrink-0 mt-0.5" />
            <div className="leading-relaxed text-[11px]">
              <strong>Preliminary Matching Notice:</strong> LifeLink AI algorithmic recommendations assist emergency response teams. Certified hospital laboratory cross-matching is strictly conducted before any blood collection or transfusion.
            </div>
          </div>

          {/* Error Banner */}
          {authError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-3.5 rounded-xl bg-crimson-50 border border-crimson-200 text-xs text-crimson-900 flex items-start gap-2.5 shadow-sm"
            >
              <AlertCircle className="w-4 h-4 text-crimson-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong>Registration Error:</strong> {authError}
              </div>
            </motion.div>
          )}

          {/* Multi-Section Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Section 1: Personal Details */}
            <div className="space-y-4">
              <div className="border-b border-gray-100 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-burgundy-950 flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-burgundy-600" />
                  1. Personal &amp; Medical Details
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  placeholder="e.g. Sarah Jenkins"
                  leftIcon={<User className="w-4 h-4" />}
                  error={errors.name?.message}
                  required
                  {...register('name')}
                />

                <Input
                  label="Email Address"
                  type="email"
                  placeholder="sarah@example.com"
                  leftIcon={<Mail className="w-4 h-4" />}
                  error={errors.email?.message}
                  required
                  {...register('email')}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Phone Number"
                  placeholder="+1 (555) 000-0000"
                  leftIcon={<Phone className="w-4 h-4" />}
                  error={errors.phone?.message}
                  required
                  {...register('phone')}
                />

                <Input
                  label="Date of Birth (18+)"
                  type="date"
                  leftIcon={<Calendar className="w-4 h-4" />}
                  error={errors.dob?.message}
                  required
                  {...register('dob')}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Blood Group"
                  options={bloodGroupOptions}
                  leftIcon={<Droplet className="w-4 h-4 text-crimson-600" />}
                  error={errors.bloodGroup?.message}
                  required
                  {...register('bloodGroup')}
                />

                <Select
                  label="Preferred Contact Channel"
                  options={contactOptions}
                  error={errors.contactPreference?.message}
                  required
                  {...register('contactPreference')}
                />
              </div>
            </div>

            {/* Section 2: Location Details */}
            <div className="space-y-4 pt-2">
              <div className="border-b border-gray-100 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-burgundy-950 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-burgundy-600" />
                  2. Location Details
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="City"
                  placeholder="e.g. Seattle"
                  leftIcon={<MapPin className="w-4 h-4" />}
                  error={errors.city?.message}
                  required
                  {...register('city')}
                />

                <Input
                  label="State / Province"
                  placeholder="e.g. Washington"
                  error={errors.state?.message}
                  required
                  {...register('state')}
                />
              </div>
            </div>

            {/* Section 3: Security & Credentials */}
            <div className="space-y-4 pt-2">
              <div className="border-b border-gray-100 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-burgundy-950 flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-burgundy-600" />
                  3. Account Security
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Create Password"
                    type="password"
                    placeholder="Min. 8 characters"
                    leftIcon={<Lock className="w-4 h-4" />}
                    error={errors.password?.message}
                    required
                    {...register('password')}
                  />

                  {/* Password Strength Indicator */}
                  {passwordVal.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-secondary-text">Strength:</span>
                        <span className="font-bold text-primary-text">
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden flex gap-1">
                        {[1, 2, 3, 4, 5].map((lvl) => (
                          <div
                            key={lvl}
                            className={`h-full flex-1 rounded-full transition-colors ${
                              passwordStrength.score >= lvl
                                ? passwordStrength.color
                                : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="Re-enter password"
                  leftIcon={<Lock className="w-4 h-4" />}
                  error={errors.confirmPassword?.message}
                  required
                  {...register('confirmPassword')}
                />
              </div>
            </div>

            {/* Consent Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-burgundy-100 bg-burgundy-50/40 cursor-pointer text-xs leading-relaxed text-secondary-text">
                <input
                  type="checkbox"
                  className="mt-0.5 rounded border-burgundy-300 text-burgundy-600 focus:ring-burgundy-500/20"
                  {...register('consent')}
                />
                <span>
                  I confirm I am at least 18 years of age and voluntarily consent to LifeLink AI contacting me via my chosen preference during regional blood emergencies. I understand matching recommendations are preliminary and subject to mandatory clinical laboratory verification.
                </span>
              </label>
              {errors.consent && (
                <p className="mt-1.5 text-xs text-crimson-600 font-medium">
                  {errors.consent.message}
                </p>
              )}
            </div>

            {/* Submit CTA */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isSubmitting}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Complete Donor Registration
              </Button>
            </div>
          </form>

          {/* Footer Navigation */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <p className="text-secondary-text">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-burgundy-700 hover:underline">
                Sign in here
              </Link>
            </p>

            <Link
              to="/register/hospital"
              className="inline-flex items-center gap-1.5 font-semibold text-secondary-text hover:text-burgundy-700 transition-colors"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Registering a Hospital or Blood Bank?</span>
            </Link>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default RegisterDonor;
