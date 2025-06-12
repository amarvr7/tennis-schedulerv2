import { ReactNode } from 'react';
import Typography from './Typography';

interface CardProps {
  children: ReactNode;
  title?: string | ReactNode;
  footer?: ReactNode;
  variant?: 'default' | 'bordered' | 'elevated';
  className?: string;
}

/**
 * Card component that adheres to our design token system
 * Uses only semantic color tokens and other available design tokens
 */
export default function Card({
  children,
  title,
  footer,
  variant = 'default',
  className = '',
}: CardProps) {
  const variantClasses = {
    default: 'bg-white',
    bordered: 'bg-white border border-neutral-200',
    elevated: 'bg-white shadow-md',
  };

  return (
    <div className={`rounded-lg overflow-hidden ${variantClasses[variant]} ${className}`}>
      {title && (
        <div className="px-4 py-3 border-b border-neutral-200">
          {typeof title === 'string' ? (
            <Typography variant="h5" weight="medium">{title}</Typography>
          ) : (
            title
          )}
        </div>
      )}
      
      <div className="p-4">
        {children}
      </div>
      
      {footer && (
        <div className="px-4 py-3 bg-neutral-50 border-t border-neutral-200">
          {footer}
        </div>
      )}
    </div>
  );
} 