import { ReactNode, useState } from 'react';
import Typography from './Typography';

interface TooltipProps {
  children: ReactNode;
  content: string;
  position?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

/**
 * Tooltip component that adheres to our design token system
 * Uses only semantic color tokens defined in tailwind.config.js
 */
export default function Tooltip({
  children,
  content,
  position = 'top',
  className = '',
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 mb-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 translate-x-2 ml-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 translate-y-2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 -translate-x-2 mr-2',
  };
  
  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-t-neutral-800 border-l-transparent border-r-transparent border-b-transparent',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-r-neutral-800 border-t-transparent border-b-transparent border-l-transparent',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-b-neutral-800 border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-l-neutral-800 border-t-transparent border-b-transparent border-r-transparent',
  };
  
  return (
    <span 
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      
      {isVisible && (
        <span className={`absolute z-tooltip ${positionClasses[position]}`}>
          <span className="relative">
            {/* Tooltip content */}
            <span className="bg-neutral-800 text-white py-1.5 px-3 rounded shadow-lg whitespace-nowrap block">
              <Typography variant="small" className="text-white">
                {content}
              </Typography>
            </span>
            
            {/* Arrow */}
            <span className={`absolute w-0 h-0 border-4 ${arrowClasses[position]} block`} />
          </span>
        </span>
      )}
    </span>
  );
} 