import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children?: React.ReactNode;
  hoverable?: boolean;
  glow?: boolean;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, hoverable = true, glow = false, className = '', ...motionProps }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={
          hoverable
            ? {
                y: -4,
                boxShadow:
                  '0 20px 35px -10px rgba(143, 21, 55, 0.12), 0 0 25px -5px rgba(244, 166, 183, 0.25)',
                transition: { type: 'spring', stiffness: 350, damping: 25 },
              }
            : undefined
        }
        className={`
          relative rounded-3xl backdrop-blur-xl bg-white/75
          border border-white/40
          shadow-xl shadow-burgundy-950/5
          overflow-hidden
          transition-colors duration-200
          ${glow ? 'ring-1 ring-burgundy-200/50' : ''}
          ${className}
        `}
        {...motionProps}
      >
        {/* Subtle decorative inner top highlight */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" />
        {children}
      </motion.div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

export default GlassCard;
