import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  containerClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightElement,
      type = 'text',
      id,
      name,
      required,
      disabled,
      className = '',
      containerClassName = '',
      ...rest
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
    const inputId = id || name || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
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

          <input
            ref={ref}
            id={inputId}
            name={name}
            type={inputType}
            required={required}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            className={`
              w-full text-sm text-primary-text bg-white/90 rounded-xl border transition-all duration-150
              placeholder:text-secondary-text/50
              focus:outline-none focus:ring-2
              ${leftIcon ? 'pl-10' : 'pl-3.5'}
              ${isPassword || rightElement ? 'pr-11' : 'pr-3.5'}
              py-2.5
              ${
                error
                  ? 'border-crimson-500 text-crimson-950 focus:border-crimson-600 focus:ring-crimson-500/20 bg-crimson-50/20'
                  : 'border-burgundy-200/80 hover:border-burgundy-300 focus:border-burgundy-600 focus:ring-burgundy-600/15'
              }
              ${disabled ? 'bg-gray-100 text-secondary-text/70 cursor-not-allowed border-gray-200' : ''}
              ${className}
            `}
            {...rest}
          />

          {isPassword ? (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 p-1 rounded-lg text-secondary-text hover:text-burgundy-700 hover:bg-burgundy-50/50 transition-colors focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          ) : (
            rightElement && <div className="absolute right-3 flex items-center">{rightElement}</div>
          )}
        </div>

        {error ? (
          <p
            id={`${inputId}-error`}
            className="mt-1.5 text-xs text-crimson-600 flex items-center gap-1 font-medium animate-fadeIn"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p id={`${inputId}-helper`} className="mt-1.5 text-[11px] text-secondary-text">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
