import { InputHTMLAttributes, forwardRef, ReactNode } from 'react';
import Typography from './Typography';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
  description?: string;
  error?: string;
}

/**
 * Checkbox component that adheres to our design token system
 * Uses only semantic color tokens defined in tailwind.config.js
 */
const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, error, className = '', ...props }, ref) => {
    return (
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            type="checkbox"
            ref={ref}
            className={`
              h-4 w-4 rounded border-neutral-300 text-primary-600 
              focus:ring-primary-500 focus:ring-2 focus:ring-offset-0
              ${error ? 'border-error-500' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {(label || description) && (
          <div className="ml-3 text-sm">
            {label && (
              <div className={`${props.disabled ? 'opacity-70' : ''}`}>
                {typeof label === 'string' ? (
                  <Typography variant="small" weight="medium">
                    {label}
                  </Typography>
                ) : (
                  label
                )}
              </div>
            )}
            {description && (
              <Typography variant="subtle">{description}</Typography>
            )}
            {error && (
              <Typography variant="small" className="mt-1 text-error-500">
                {error}
              </Typography>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox; 