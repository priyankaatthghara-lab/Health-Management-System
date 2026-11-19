import React from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
  placeholder?: string;
  leftIcon?: React.ReactNode;
  containerClassName?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options,
      error,
      helperText,
      placeholder,
      leftIcon,
      id,
      name,
      required,
      disabled,
      className = '',
      containerClassName = '',
      children,
      ...rest
    },
    ref
  ) => {
    const selectId = id || name || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold text-primary-text mb-1.5 select-none"
          >
            {label}
            {required && <span className="text-crimson-600 ml-1 font-bold">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center justify-center text-secondary-text pointer-events-none">
              {leftIcon}
            </div>
          )}

          <select
            ref={ref}
            id={selectId}
            name={name}
            required={required}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={
              error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined
            }
            className={`
              w-full text-sm text-primary-text bg-white/90 rounded-xl border appearance-none transition-all duration-150
              focus:outline-none focus:ring-2
              ${leftIcon ? 'pl-10' : 'pl-3.5'}
              pr-10 py-2.5
              ${
                error
                  ? 'border-crimson-500 text-crimson-950 focus:border-crimson-600 focus:ring-crimson-500/20 bg-crimson-50/20'
                  : 'border-burgundy-200/80 hover:border-burgundy-300 focus:border-burgundy-600 focus:ring-burgundy-600/15'
              }
              ${disabled ? 'bg-gray-100 text-secondary-text/70 cursor-not-allowed border-gray-200' : 'cursor-pointer'}
              ${className}
            `}
            {...rest}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
            {children}
          </select>

          <div className="absolute right-3.5 flex items-center justify-center pointer-events-none text-secondary-text">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        {error ? (
          <p
            id={`${selectId}-error`}
            className="mt-1.5 text-xs text-crimson-600 flex items-center gap-1 font-medium animate-fadeIn"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p id={`${selectId}-helper`} className="mt-1.5 text-[11px] text-secondary-text">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
