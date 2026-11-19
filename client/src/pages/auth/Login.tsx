import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import {
  Heart,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Building2,
  HeartHandshake,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Input, Button, GlassCard } from '@/components/ui';

// Zod validation schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fromPath = (location.state as { from?: { pathname?: string } })?.from?.pathname;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setAuthError(null);
      setIsSubmitting(true);

      await login(data.email, data.password);

      if (data.rememberMe) {
        localStorage.setItem('lifelink_remembered_email', data.email);
      } else {
        localStorage.removeItem('lifelink_remembered_email');
      }

      // Check where to redirect
      if (fromPath && fromPath !== '/login') {
        navigate(fromPath, { replace: true });
        return;
      }

      // Fallback: check stored user or default to donor dashboard
      // Note: AuthContext sets user synchronously before resolving login
      const storedToken = localStorage.getItem('lifelink_token');
      if (storedToken) {
        try {
          const payloadBase64 = storedToken.split('.')[1];
          if (payloadBase64) {
            const decoded = JSON.parse(atob(payloadBase64));
            if (decoded.role === 'hospital') {
              navigate('/hospital/dashboard', { replace: true });
              return;
            }
            if (decoded.role === 'admin') {
              navigate('/admin/dashboard', { replace: true });
              return;
            }
          }
        } catch {
          // Ignore token parse error and fallback
        }
      }

      navigate('/donor/dashboard', { replace: true });
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string; error?: string } }; message?: string };
      const errorMessage =
        errorObj.response?.data?.message ||
        errorObj.response?.data?.error ||
        errorObj.message ||
        'Unable to sign in. Please verify your credentials and try again.';
      setAuthError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden bg-gradient-to-br from-warm-bg via-rose-50/20 to-burgundy-50/30">
      {/* Background Decorative Blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-burgundy-200/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-rose-200/25 rounded-full blur-3xl pointer-events-none" />

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
              Sign In to Your Account
            </h1>
            <p className="text-xs text-secondary-text mt-1">
              Access the clinical network for blood donations and emergency requests
            </p>
          </div>

          {/* Error Banner */}
          {authError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-3.5 rounded-xl bg-crimson-50 border border-crimson-200/80 text-xs text-crimson-900 flex items-start gap-2.5 shadow-sm"
            >
              <AlertCircle className="w-4 h-4 text-crimson-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong>Authentication Failed:</strong> {authError}
              </div>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              required
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.password?.message}
              required
              {...register('password')}
            />

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-secondary-text hover:text-primary-text">
                <input
                  type="checkbox"
                  className="rounded border-burgundy-200 text-burgundy-600 focus:ring-burgundy-500/20"
                  {...register('rememberMe')}
                />
                <span>Remember me</span>
              </label>

              <Link
                to="/forgot-password"
                className="font-medium text-burgundy-700 hover:text-burgundy-900 hover:underline transition-colors"
              >
                Forgot Password?
              </Link>
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
                Sign In
              </Button>
            </div>
          </form>

          {/* Registration Options Divider */}
          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200/80" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
              <span className="bg-white/80 px-3 text-secondary-text font-semibold backdrop-blur-sm">
                New to LifeLink AI?
              </span>
            </div>
          </div>

          {/* Registration Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <Link
              to="/register/donor"
              className="flex items-center gap-2.5 p-3 rounded-xl border border-burgundy-100 bg-white/70 hover:bg-burgundy-50/60 hover:border-burgundy-200 transition-all text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-burgundy-100/70 text-burgundy-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-primary-text group-hover:text-burgundy-900 transition-colors">
                  Join as Donor
                </p>
                <p className="text-[10px] text-secondary-text truncate">Save lives on-call</p>
              </div>
            </Link>

            <Link
              to="/register/hospital"
              className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-200/80 bg-white/70 hover:bg-gray-50 hover:border-gray-300 transition-all text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-primary-text group-hover:text-burgundy-900 transition-colors">
                  Hospital Portal
                </p>
                <p className="text-[10px] text-secondary-text truncate">Coordinate supplies</p>
              </div>
            </Link>
          </div>

          {/* Clinical Security Notice */}
          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <span className="inline-flex items-center gap-1.5 text-[11px] text-secondary-text">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Secured with medical-grade cryptographic tokens
            </span>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default Login;
