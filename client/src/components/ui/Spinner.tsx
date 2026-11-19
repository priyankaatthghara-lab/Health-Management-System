import React from 'react';

export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerColor = 'burgundy' | 'crimson' | 'white' | 'gray' | 'current';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: SpinnerSize;
  color?: SpinnerColor;
  label?: string;
}

const sizeStyles: Record<SpinnerSize, string> = {
  sm: 'w-4 h-4 border-2',
  md: 'w-7 h-7 border-[2.5px]',
  lg: 'w-10 h-10 border-3',
  xl: 'w-14 h-14 border-4',
};

const colorStyles: Record<SpinnerColor, { track: string; head: string }> = {
  burgundy: {
    track: 'border-burgundy-100',
    head: 'border-t-burgundy-600',
  },
  crimson: {
    track: 'border-crimson-100',
    head: 'border-t-crimson-600',
  },
  white: {
    track: 'border-white/20',
    head: 'border-t-white',
  },
  gray: {
    track: 'border-gray-200',
    head: 'border-t-gray-600',
  },
  current: {
    track: 'border-current/20',
    head: 'border-t-current',
  },
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'burgundy',
  label = 'Loading...',
  className = '',
  ...props
}) => {
  const styles = colorStyles[color];

  return (
    <div
      role="status"
      aria-label={label}
      className={`inline-flex items-center justify-center ${className}`}
      {...props}
    >
      <div
        className={`
          rounded-full animate-spin
          ${sizeStyles[size]}
          ${styles.track}
          ${styles.head}
        `}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
};

Spinner.displayName = 'Spinner';

export default Spinner;
