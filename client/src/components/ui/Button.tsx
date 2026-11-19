import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-burgundy text-white hover:bg-burgundy-700 active:bg-burgundy-800 shadow-sm focus:ring-burgundy-500/30 border border-transparent',
  secondary:
    'bg-burgundy-50 text-burgundy-800 hover:bg-burgundy-100 active:bg-burgundy-200 border border-burgundy-200 focus:ring-burgundy-400/20',
  outline:
    'bg-transparent text-burgundy-800 border border-burgundy-300 hover:bg-burgundy-50 active:bg-burgundy-100 focus:ring-burgundy-400/20',
  ghost:
    'bg-transparent text-secondary-text hover:text-burgundy-800 hover:bg-burgundy-50/60 active:bg-burgundy-100/60 border border-transparent focus:ring-burgundy-400/20',
  danger:
    'bg-crimson text-white hover:bg-crimson-700 active:bg-crimson-800 shadow-sm focus:ring-crimson-500/30 border border-transparent',
  success:
    'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 shadow-sm focus:ring-emerald-500/30 border border-transparent',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'text-xs px-3 py-1.5 gap-1.5 rounded-lg font-medium',
  md: 'text-sm px-4 py-2 gap-2 rounded-xl font-medium',
  lg: 'text-base px-6 py-3 gap-2.5 rounded-xl font-semibold',
};

const iconSizes: Record<ButtonSize, string> = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      className = '',
      type = 'button',
      ...motionProps
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <motion.button
        ref={ref}
        type={type}
        disabled={isDisabled}
        whileHover={isDisabled ? undefined : { scale: 1.015 }}
        whileTap={isDisabled ? undefined : { scale: 0.985 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={`
          inline-flex items-center justify-center select-none cursor-pointer
          transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? 'w-full' : ''}
          ${isDisabled ? 'opacity-55 cursor-not-allowed pointer-events-none' : ''}
          ${className}
        `}
        {...motionProps}
      >
        {isLoading ? (
          <>
            <Loader2 className={`animate-spin ${iconSizes[size]}`} />
            <span>{children}</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
            {children && <span>{children}</span>}
            {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
          </>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
