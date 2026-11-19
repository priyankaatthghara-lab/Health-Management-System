import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import {
  Building2,
  Mail,
  Phone,
  Lock,
  MapPin,
  FileCheck,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  HeartHandshake,
  Heart,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Input, Button, GlassCard, Select } from '@/components/ui';

const hospitalRegistrationSchema = z
  .object({
    hospitalName: z.string().min(2, 'Hospital or organization name is required'),
    name: z.string().min(2, 'Authorized representative name is required'),
    email: z.string().min(1, 'Email is required').email('Please provide a valid work email address'),
    phone: z
      .string()
      .min(10, 'General phone number must have at least 10 digits')
      .regex(/^[0-9+\-\s()]+$/, 'Please enter a valid phone number'),
    emergencyPhone: z
      .string()
      .min(10, '24/7 emergency dispatch phone must have at least 10 digits')
      .regex(/^[0-9+\-\s()]+$/, 'Please enter a valid emergency phone number'),
    hospitalType: z.enum(['Government', 'Private', 'Non-profit', 'Blood Bank'], {
      required_error: 'Please select hospital type',
    }),
    registrationNumber: z.string().optional(),
    licenseNumber: z.string().optional(),
    address: z.string().min(5, 'Physical facility address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State / Province is required'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
      .regex(/[a-z]/, 'Password must include at least one lowercase letter')
      .regex(/[0-9]/, 'Password must include at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    complianceAck: z.literal(true, {
      errorMap: () => ({ message: 'You must acknowledge the hospital verification protocols' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type HospitalRegistrationFormData = z.infer<typeof hospitalRegistrationSchema>;

const hospitalTypeOptions = [
  { value: 'Private', label: 'Private Multi-Specialty Hospital / Clinic' },
  { value: 'Government', label: 'Government / Public Healthcare Center' },
  { value: 'Non-profit', label: 'Non-Profit / Charitable Hospital' },
  { value: 'Blood Bank', label: 'Stand-alone Licensed Blood Bank' },
];

export const RegisterHospital: React.FC = () => {
  const { registerHospital } = useAuth();
  const navigate = useNavigate();

  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<HospitalRegistrationFormData>({
    resolver: zodResolver(hospitalRegistrationSchema),
    defaultValues: {
      hospitalName: '',
      name: '',
      email: '',
      phone: '',
      emergencyPhone: '',
      hospitalType: 'Private',
      registrationNumber: '',
      licenseNumber: '',
      address: '',
      city: '',
      state: '',
      password: '',
      confirmPassword: '',
      complianceAck: false as unknown as true,
    },
  });

  const onSubmit = async (data: HospitalRegistrationFormData) => {
    try {
      setAuthError(null);
      setIsSubmitting(true);

      const payload = {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        hospitalName: data.hospitalName.trim(),
        registrationNumber: data.registrationNumber?.trim() || undefined,
        licenseNumber: data.licenseNumber?.trim() || undefined,
        phone: data.phone.trim(),
        emergencyPhone: data.emergencyPhone.trim(),
        address: data.address.trim(),
        city: data.city.trim(),
        state: data.state.trim(),
        hospitalType: data.hospitalType,
        // Default coordinates if geocoding is handled on server
        coordinates: {
          lat: 28.6139,
          lng: 77.209,
        },
      };

      await registerHospital(payload);
      navigate('/hospital/dashboard', { replace: true });
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string; error?: string } }; message?: string };
      const errorMessage =
        errorObj.response?.data?.message ||
        errorObj.response?.data?.error ||
        errorObj.message ||
        'Hospital registration failed. Please review your entries and try again.';
      setAuthError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden bg-gradient-to-br from-warm-bg via-rose-50/20 to-burgundy-50/30">
      {/* Decorative ambient background glows */}
      <div className="absolute top-10 left-10 w-80 h-80 bg-rose-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-burgundy-200/25 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-3xl relative z-10 my-6"
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
              Hospital &amp; Blood Bank Registration
            </h1>
            <p className="text-xs text-secondary-text mt-1 max-w-lg mx-auto">
              Onboard your healthcare facility to request emergency blood components, discover compatible local donors, and automate emergency dispatch.
            </p>
          </div>

          {/* Verification Protocol Notice */}
          <div className="mb-6 p-4 rounded-2xl bg-blue-50/80 border border-blue-200 text-xs text-blue-950 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <div className="leading-relaxed space-y-1">
              <p className="font-bold text-blue-900">Mandatory Verification Procedure</p>
              <p className="text-[11px] text-blue-800">
                To guarantee patient safety, all hospital and blood bank accounts undergo verification by our clinical compliance board before live emergency matches can be broadcasted. You will be able to access your dashboard immediately in onboarding mode.
              </p>
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

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Section 1: Facility Info */}
            <div className="space-y-4">
              <div className="border-b border-gray-100 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-burgundy-950 flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-burgundy-600" />
                  1. Facility Information
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Hospital / Organization Name"
                  placeholder="e.g. City General Trauma Center"
                  leftIcon={<Building2 className="w-4 h-4" />}
                  error={errors.hospitalName?.message}
                  required
                  {...register('hospitalName')}
                />

                <Select
                  label="Facility Category"
                  options={hospitalTypeOptions}
                  error={errors.hospitalType?.message}
                  required
                  {...register('hospitalType')}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Hospital Registration Number"
                  placeholder="e.g. HOSP-REG-2024-912"
                  helperText="Official medical registry number"
                  leftIcon={<FileCheck className="w-4 h-4" />}
                  error={errors.registrationNumber?.message}
                  {...register('registrationNumber')}
                />

                <Input
                  label="Blood Bank License Number (Optional)"
                  placeholder="e.g. BB-LIC-58291"
                  helperText="Required if operating on-site blood storage"
                  leftIcon={<FileCheck className="w-4 h-4" />}
                  error={errors.licenseNumber?.message}
                  {...register('licenseNumber')}
                />
              </div>
            </div>

            {/* Section 2: Contact & Personnel */}
            <div className="space-y-4 pt-2">
              <div className="border-b border-gray-100 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-burgundy-950 flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-burgundy-600" />
                  2. Authorized Contact &amp; 24/7 Hotline
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Authorized Administrator Name"
                  placeholder="e.g. Dr. Robert Vance, MD"
                  error={errors.name?.message}
                  required
                  {...register('name')}
                />

                <Input
                  label="Official Institutional Email"
                  type="email"
                  placeholder="contact@citygeneral.org"
                  leftIcon={<Mail className="w-4 h-4" />}
                  error={errors.email?.message}
                  required
                  {...register('email')}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Administrative Phone"
                  placeholder="+1 (555) 012-3456"
                  leftIcon={<Phone className="w-4 h-4" />}
                  error={errors.phone?.message}
                  required
                  {...register('phone')}
                />

                <Input
                  label="24/7 Emergency Blood Hotline"
                  placeholder="+1 (555) 999-0000"
                  leftIcon={<Phone className="w-4 h-4 text-crimson-600" />}
                  helperText="Dedicated direct line for critical donor arrivals"
                  error={errors.emergencyPhone?.message}
                  required
                  {...register('emergencyPhone')}
                />
              </div>
            </div>

            {/* Section 3: Physical Address */}
            <div className="space-y-4 pt-2">
              <div className="border-b border-gray-100 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-burgundy-950 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-burgundy-600" />
                  3. Facility Location
                </h3>
              </div>

              <Input
                label="Physical Facility Address"
                placeholder="100 Medical Center Way, Suite 400"
                leftIcon={<MapPin className="w-4 h-4" />}
                error={errors.address?.message}
                required
                {...register('address')}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="City"
                  placeholder="e.g. Seattle"
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

            {/* Section 4: Security Credentials */}
            <div className="space-y-4 pt-2">
              <div className="border-b border-gray-100 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-burgundy-950 flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-burgundy-600" />
                  4. Portal Credentials
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Password"
                  type="password"
                  placeholder="Min. 8 characters"
                  leftIcon={<Lock className="w-4 h-4" />}
                  error={errors.password?.message}
                  required
                  {...register('password')}
                />

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

            {/* Verification Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-burgundy-100 bg-burgundy-50/40 cursor-pointer text-xs leading-relaxed text-secondary-text">
                <input
                  type="checkbox"
                  className="mt-0.5 rounded border-burgundy-300 text-burgundy-600 focus:ring-burgundy-500/20"
                  {...register('complianceAck')}
                />
                <span>
                  I attest that I am an authorized representative of this medical institution. I understand that all accounts require clinical credential verification, and that LifeLink AI algorithms provide preliminary match recommendations requiring clinical validation prior to blood administration.
                </span>
              </label>
              {errors.complianceAck && (
                <p className="mt-1.5 text-xs text-crimson-600 font-medium">
                  {errors.complianceAck.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isSubmitting}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Submit Hospital Onboarding Application
              </Button>
            </div>
          </form>

          {/* Footer Navigation */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <p className="text-secondary-text">
              Already registered?{' '}
              <Link to="/login" className="font-bold text-burgundy-700 hover:underline">
                Sign in to hospital portal
              </Link>
            </p>

            <Link
              to="/register/donor"
              className="inline-flex items-center gap-1.5 font-semibold text-secondary-text hover:text-burgundy-700 transition-colors"
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Looking to donate blood instead?</span>
            </Link>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default RegisterHospital;
