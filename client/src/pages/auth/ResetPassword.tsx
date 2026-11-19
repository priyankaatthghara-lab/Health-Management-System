import React, { useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import {
  Heart,
  Lock,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';
import { post } from '@/services/api';
import { Input, Button, GlassCard } from '@/components/ui';

const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Password reset token is required'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
      .regex(/[a-z]/, 'Password must include at least one lowercase letter')
      .regex(/[0-9]/, 'Password must include at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const routeParams = useParams<{ token?: string }>();

  // Extract token from query parameter or route param
  const initialToken = searchParams.get('token') || routeParams.token || '';

  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: initialToken,
      password: '',
      confirmPassword: '',
    },
  });

  const passwordVal = watch('password') || '';

  // Password strength calculation
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

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      setAuthError(null);
      setIsSubmitting(true);

      await post('/auth/reset-password', {
        token: data.token.trim(),
        password: data.password,
      });

      setIsSuccess(true);
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2500);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string; error?: string } }; message?: string };
      const errorMessage =
        errorObj.response?.data?.message ||
        errorObj.response?.data?.error ||
        errorObj.message ||
        'Reset token is invalid or has expired. Please request a new password reset link.';
      setAuthError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden bg-gradient-to-br from-warm-bg via-rose-50/20 to-burgundy-50/30">
      {/* Background blobs */}
      <div className="absolute top-1/4 right-1/4 translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-burgundy-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 -translate-x-1/2 translate-y-1/2 w-96 h-96 bg-rose-200/25 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10 my-4"
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

            <h1 className="text-xl font-bold text-primary-text tracking-tight">
              Set New Password
            </h1>
            <p className="text-xs text-secondary-text mt-1">
              Choose a strong password to safeguard your clinical platform access
            </p>
          </div>

          {/* Success Notification */}
          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4 py-4"
            >
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-primary-text">
                  Password Updated Successfully
                </h3>
                <p className="text-xs text-secondary-text leading-relaxed">
                  Your credentials have been updated securely. Redirecting to sign in portal...
                </p>
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={() => navigate('/login', { replace: true })}
                >
                  Proceed to Sign In Now
                </Button>
              </div>
            </motion.div>
          ) : (
            /* Reset Form */
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {authError && (
                <div className="p-3.5 rounded-xl bg-crimson-50 border border-crimson-200 text-xs text-crimson-900 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-crimson-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <strong>Error:</strong> {authError}
                  </div>
                </div>
              )}

              <Input
                label="Reset Token"
                placeholder="Paste token received in email"
                leftIcon={<KeyRound className="w-4 h-4" />}
                error={errors.token?.message}
                required
                {...register('token')}
              />

              <div>
                <Input
                  label="New Password"
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
                label="Confirm New Password"
                type="password"
                placeholder="Re-enter new password"
                leftIcon={<Lock className="w-4 h-4" />}
                error={errors.confirmPassword?.message}
                required
                {...register('confirmPassword')}
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  isLoading={isSubmitting}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Update Account Password
                </Button>
              </div>

              <div className="pt-4 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary-text hover:text-burgundy-800 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}

          {/* Compliance Badge */}
          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <span className="inline-flex items-center gap-1.5 text-[11px] text-secondary-text">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Cryptographic hash verification protocol
            </span>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
