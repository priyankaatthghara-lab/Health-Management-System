import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import {
  Heart,
  Mail,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  KeyRound,
} from 'lucide-react';
import { post } from '@/services/api';
import { Input, Button, GlassCard } from '@/components/ui';

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const ForgotPassword: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      setSubmittedEmail(data.email);

      await post('/auth/forgot-password', { email: data.email });
      setIsSuccess(true);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string; error?: string } }; message?: string };
      // Note: for security reasons, many auth backends return success anyway.
      // If server returns an explicit error message:
      const msg =
        errorObj.response?.data?.message ||
        errorObj.response?.data?.error ||
        errorObj.message;

      // If network error, show error; otherwise we can still show instructions
      if (errorObj.response && errorObj.response.status >= 500) {
        setErrorMessage(msg || 'Server error occurred while dispatching reset token. Please try again later.');
      } else {
        // Still treat user-friendly for privacy (don't leak if email exists)
        setIsSuccess(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden bg-gradient-to-br from-warm-bg via-rose-50/20 to-burgundy-50/30">
      {/* Decorative ambient glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-burgundy-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-rose-200/20 rounded-full blur-3xl pointer-events-none" />

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
              Reset Your Password
            </h1>
            <p className="text-xs text-secondary-text mt-1">
              Enter the registered email associated with your LifeLink account
            </p>
          </div>

          {/* Success State */}
          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-5"
            >
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-bold text-primary-text">
                  Reset Link Dispatched
                </h3>
                <p className="text-xs text-secondary-text leading-relaxed">
                  If an account exists for <strong className="text-primary-text">{submittedEmail}</strong>, we have sent a secure password reset link with instructions.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-burgundy-50/70 border border-burgundy-100 text-[11px] text-burgundy-900 text-left space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-burgundy-700" />
                  Next Steps:
                </p>
                <ol className="list-decimal list-inside space-y-0.5 text-secondary-text">
                  <li>Check your inbox and spam folders.</li>
                  <li>Click the secure link within 15 minutes.</li>
                  <li>Enter your new cryptographic password.</li>
                </ol>
              </div>

              <div className="pt-2 flex flex-col gap-2.5">
                <Link
                  to={`/reset-password?email=${encodeURIComponent(submittedEmail)}`}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-burgundy-50 border border-burgundy-200 text-burgundy-900 text-xs font-semibold hover:bg-burgundy-100 transition-colors"
                >
                  <KeyRound className="w-3.5 h-3.5 text-burgundy-600" />
                  <span>Have a reset token? Enter it directly</span>
                </Link>

                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-secondary-text hover:text-burgundy-800 transition-colors py-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Sign In</span>
                </Link>
              </div>
            </motion.div>
          ) : (
            /* Request Form */
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-crimson-50 border border-crimson-200 text-xs text-crimson-900 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-crimson-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <Input
                label="Registered Email Address"
                type="email"
                autoComplete="email"
                placeholder="doctor@hospital.org or donor@mail.com"
                leftIcon={<Mail className="w-4 h-4" />}
                error={errors.email?.message}
                required
                {...register('email')}
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
                  Send Password Reset Link
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
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
