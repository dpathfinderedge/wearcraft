import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, type = 'text', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-2 block text-xs font-medium uppercase tracking-[0.1em] text-muted">
            {label}
            {props.required && <span className="ml-1 text-clay">*</span>}
          </label>
        )}
        <input
          type={type}
          className={cn(
            'w-full border border-line bg-white px-3.5 py-3 text-sm text-ink outline-none transition-colors placeholder:text-gray-400',
            'focus:border-olive focus:ring-1 focus:ring-olive',
            'disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500',
            error && 'border-clay focus:border-clay focus:ring-clay',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-clay">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-xs text-muted">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';