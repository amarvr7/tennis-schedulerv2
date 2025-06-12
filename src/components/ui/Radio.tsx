import { InputHTMLAttributes, forwardRef } from 'react';

interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  error?: string;
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, description, error, className = '', ...props }, ref) => {
    return (
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            type="radio"
            ref={ref}
            className={`h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500
              ${error ? 'border-red-500' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {(label || description) && (
          <div className="ml-3 text-sm">
            {label && (
              <label
                htmlFor={props.id}
                className={`font-medium text-gray-700 ${props.disabled ? 'opacity-70' : ''}`}
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-gray-500">{description}</p>
            )}
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
        )}
      </div>
    );
  }
);

Radio.displayName = 'Radio';

export default Radio; 