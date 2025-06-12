import { useEffect, useState } from 'react';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import Typography from './Typography';
import Button from './Button';

interface ToastProps {
  isVisible: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  variant?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  className?: string;
}

// Example component for demo purposes
export function ToastExample() {
  const [activeToast, setActiveToast] = useState<'success' | 'error' | 'warning' | 'info' | null>(null);
  
  const handleShowToast = (variant: 'success' | 'error' | 'warning' | 'info') => {
    setActiveToast(variant);
    // Auto-dismiss after 3 seconds
    setTimeout(() => setActiveToast(null), 3000);
  };
  
  const titles = {
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Information'
  };
  
  const messages = {
    success: 'Operation completed successfully!',
    error: 'An error occurred. Please try again.',
    warning: 'Please review the information before proceeding.',
    info: 'This is an informational notification.'
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <Button variant="primary" size="sm" onClick={() => handleShowToast('success')}>
          Show Success
        </Button>
        <Button variant="primary" size="sm" onClick={() => handleShowToast('error')}>
          Show Error
        </Button>
        <Button variant="primary" size="sm" onClick={() => handleShowToast('warning')}>
          Show Warning
        </Button>
        <Button variant="primary" size="sm" onClick={() => handleShowToast('info')}>
          Show Info
        </Button>
      </div>
      
      {activeToast && (
        <Toast
          isVisible={true}
          onClose={() => setActiveToast(null)}
          title={titles[activeToast]}
          message={messages[activeToast]}
          variant={activeToast}
          duration={3000}
        />
      )}
    </div>
  );
}

/**
 * Toast component that adheres to our design token system
 * Uses only semantic color tokens defined in tailwind.config.js
 */
export default function Toast({
  isVisible,
  onClose,
  title,
  message,
  variant = 'info',
  duration = 5000,
  className = ''
}: ToastProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);
  
  if (!isVisible) return null;
  
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
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div 
        className={`
          rounded-lg border shadow-md p-4
          ${variantClasses[variant]}
          transform transition-all duration-300 ease-in-out
          ${className}
        `}
      >
        <div className="flex">
          <div className="flex-shrink-0">
            {variantIcons[variant]}
          </div>
          
          <div className="ml-3 flex-1">
            {title && (
              <Typography variant="small" weight="medium" className="mb-1">
                {title}: 
              </Typography>
            )}
            
            <Typography variant="small">
              {message}
            </Typography>
          </div>
          
          <div className="ml-auto pl-3">
            <button
              type="button"
              className="inline-flex rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 focus:outline-none"
              onClick={onClose}
            >
              <span className="sr-only">Dismiss</span>
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 