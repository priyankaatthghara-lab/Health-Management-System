import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

export type CardVariant = 'default' | 'glass' | 'elevated';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  variant?: CardVariant;
  padding?: CardPadding;
  hoverEffect?: boolean;
  children?: React.ReactNode;
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-white border border-burgundy-100/80 shadow-sm shadow-burgundy-900/5',
  glass: 'bg-white/80 backdrop-blur-md border border-white/60 shadow-lg shadow-burgundy-950/5',
  elevated: 'bg-white border border-burgundy-100/50 shadow-xl shadow-burgundy-950/10',
};

const paddingStyles: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8 sm:p-10',
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      hoverEffect = false,
      children,
      className = '',
      ...motionProps
    },
    ref
  ) => {
    return (
      <motion.div
        ref={ref}
        whileHover={
          hoverEffect
            ? {
                y: -3,
                boxShadow: '0 18px 30px -10px rgba(143, 21, 55, 0.12)',
                transition: { duration: 0.2 },
              }
            : undefined
        }
        className={`
          rounded-2xl
          ${variantStyles[variant]}
          ${paddingStyles[padding]}
          ${className}
        `}
        {...motionProps}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <div className={`space-y-1.5 pb-4 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <h3 className={`text-xl font-bold text-primary-text tracking-tight ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <p className={`text-xs text-secondary-text leading-relaxed ${className}`} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <div className={`space-y-4 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <div className={`pt-4 border-t border-gray-100 flex items-center ${className}`} {...props}>
    {children}
  </div>
);

export default Card;
