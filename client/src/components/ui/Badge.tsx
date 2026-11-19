import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'burgundy';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, { container: string; dot: string }> = {
  success: {
    container: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    dot: 'bg-emerald-500',
  },
  warning: {
    container: 'bg-amber-50 text-amber-800 border-amber-200/80',
    dot: 'bg-amber-500',
  },
  danger: {
    container: 'bg-crimson-50 text-crimson-800 border-crimson-200/80',
    dot: 'bg-crimson-600',
  },
  info: {
    container: 'bg-sky-50 text-sky-800 border-sky-200/80',
    dot: 'bg-sky-500',
  },
  neutral: {
    container: 'bg-gray-100 text-gray-700 border-gray-200',
    dot: 'bg-gray-400',
  },
  burgundy: {
    container: 'bg-burgundy-50 text-burgundy-800 border-burgundy-200/80',
    dot: 'bg-burgundy-600',
  },
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'text-[11px] px-2 py-0.5 gap-1.5 leading-tight font-medium',
  md: 'text-xs px-2.5 py-1 gap-1.5 leading-normal font-semibold',
};

const dotSizeStyles: Record<BadgeSize, string> = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  dot = false,
  children,
  className = '',
  ...props
}) => {
  const styles = variantStyles[variant];

  return (
    <span
      className={`
        inline-flex items-center rounded-full border tracking-wide select-none
        ${styles.container}
        ${sizeStyles[size]}
        ${className}
      `}
      {...props}
    >
      {dot && (
        <span
          className={`rounded-full shrink-0 animate-pulse ${styles.dot} ${dotSizeStyles[size]}`}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
};

Badge.displayName = 'Badge';

export default Badge;
