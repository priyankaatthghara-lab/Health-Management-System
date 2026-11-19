import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button, ButtonProps } from './Button';

export interface EmptyStateProps {
  icon?: LucideIcon | React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    variant?: ButtonProps['variant'];
  };
  children?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  children,
  className = '',
}) => {
  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) return icon;
    const IconComponent = icon as LucideIcon;
    return <IconComponent className="w-8 h-8 text-burgundy-600" />;
  };

  return (
    <div
      className={`
        flex flex-col items-center justify-center text-center p-8 sm:p-12
        rounded-3xl bg-white/60 border border-burgundy-100/60
        ${className}
      `}
    >
      {icon && (
        <div className="w-16 h-16 mb-4 rounded-2xl bg-burgundy-50 border border-burgundy-100 flex items-center justify-center shadow-sm">
          {renderIcon()}
        </div>
      )}

      <h3 className="text-lg font-bold text-primary-text tracking-tight mb-1.5">{title}</h3>

      {description && (
        <p className="text-xs text-secondary-text max-w-sm leading-relaxed mb-6">
          {description}
        </p>
      )}

      {action && (
        <Button
          variant={action.variant || 'primary'}
          size="md"
          leftIcon={action.icon}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}

      {children}
    </div>
  );
};

EmptyState.displayName = 'EmptyState';

export default EmptyState;
