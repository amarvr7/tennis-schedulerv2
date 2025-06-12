import { Fragment, ReactNode } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Button from './Button';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Dialog({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md'
}: DialogProps) {
  if (!isOpen) return null;
  
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };
  
  return (
    <Fragment>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Dialog */}
        <div 
          className={`bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} overflow-hidden`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-medium">{title}</h3>
              <button 
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          )}
          
          {/* Content */}
          <div className="p-4">
            {children}
          </div>
          
          {/* Footer */}
          {footer && (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-end space-x-2">
              {footer}
            </div>
          )}
        </div>
      </div>
    </Fragment>
  );
}

// Example usage component
export function DialogExample() {
  // In a real component, you would use React.useState to control this
  const isOpen = false;
  const onClose = () => {};
  
  return (
    <Dialog 
      isOpen={isOpen} 
      onClose={onClose}
      title="Dialog Title"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary">
            Confirm
          </Button>
        </>
      }
    >
      <p>This is the content of the dialog. You can put any React components here.</p>
    </Dialog>
  );
} 