import { ReactNode } from 'react';
import { 
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import Typography from './Typography';

interface AlertProps {
  title?: string;
  children: ReactNode;
  variant?: 'success' | 'error' | 'warning' | 'info';
  isDismissible?: boolean;
  onDismiss?: () => void;
}

/**
 * Alert component that adheres to our design token system
 * Uses only semantic color tokens defined in tailwind.config.js
 */
export default function Alert({
  title,
  children,
  variant = 'info',
  isDismissible = false,
  onDismiss
}: AlertProps) {
  const variantClasses = {
    success: 'bg-success-50 border-success text-success-700',
    error: 'bg-error-50 border-error text-error-700',
    warning: 'bg-warning-50 border-warning text-warning-700',
    info: 'bg-info-50 border-info text-info-700'
  };
  
  const variantIcons = {
    success: <CheckCircleIcon className="h-5 w-5 text-success" />,
    error: <ExclamationCircleIcon className="h-5 w-5 text-error" />,
    warning: <ExclamationCircleIcon className="h-5 w-5 text-warning" />,
    info: <InformationCircleIcon className="h-5 w-5 text-info" />
  };
  
  return (
    <div className={`rounded-md border p-4 ${variantClasses[variant]}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          {variantIcons[variant]}
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <Typography variant="small" weight="medium">{title}</Typography>
          )}
          <div className="text-sm mt-1">
            {children}
          </div>
        </div>
        {isDismissible && onDismiss && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                className="inline-flex rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 focus:outline-none"
                onClick={onDismiss}
              >
                <span className="sr-only">Dismiss</span>
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 