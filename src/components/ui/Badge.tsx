import { ReactNode } from 'react';
import { XMarkIcon } from '@heroicons/react/20/solid';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  onRemove?: () => void;
  className?: string;
}

/**
 * Badge component that adheres to our design token system
 * Uses only semantic color tokens defined in tailwind.config.js
 */
export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  rounded = false,
  onRemove,
  className = '',
}: BadgeProps) {
  const variantClasses = {
    default: 'bg-neutral-100 text-neutral-800',
    primary: 'bg-primary-100 text-primary-800',
    success: 'bg-success-100 text-success-700',
    warning: 'bg-warning-100 text-warning-700',
    danger: 'bg-error-100 text-error-700',
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1',
  };

  const roundedClass = rounded ? 'rounded-full' : 'rounded-md';

  return (
    <span
      className={`
        inline-flex items-center font-medium
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${roundedClass}
        ${onRemove ? 'pr-1' : ''}
        ${className}
      `}
    >
      {children}
      
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className={`
            ml-1 flex-shrink-0 inline-flex items-center justify-center
            focus:outline-none focus:text-neutral-500
            ${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'}
          `}
        >
          <span className="sr-only">Remove</span>
          <XMarkIcon className="w-full h-full" aria-hidden="true" />
        </button>
      )}
    </span>
  );
} 