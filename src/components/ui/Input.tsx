import { InputHTMLAttributes } from 'react';
import Typography from './Typography';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helper?: string;
  error?: string;
}

/**
 * Input component that adheres to our design token system
 * Uses only semantic color tokens defined in tailwind.config.js
 */
export default function Input({
  label,
  helper,
  error,
  disabled = false,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block mb-1">
          <Typography variant="small" weight="medium">{label}</Typography>
        </label>
      )}
      
      <input
        className={`
          w-full rounded-md border px-3 py-2 text-base
          ${error 
            ? 'border-error-500 focus:ring-error-500 focus:border-error-500' 
            : 'border-neutral-300 focus:ring-primary-500 focus:border-primary-500'}
          ${disabled ? 'bg-neutral-100 text-neutral-500 cursor-not-allowed' : 'bg-white text-neutral-900'}
          focus:outline-none focus:ring-2 focus:ring-offset-0
          transition-colors
          ${className}
        `}
        disabled={disabled}
        aria-invalid={error ? 'true' : 'false'}
        {...props}
      />
      
      {helper && !error && (
        <p className="mt-1">
          <Typography variant="subtle">{helper}</Typography>
        </p>
      )}
      
      {error && (
        <p className="mt-1 text-error-500">
          <Typography variant="small" className="text-error-500">{error}</Typography>
        </p>
      )}
    </div>
  );
} 