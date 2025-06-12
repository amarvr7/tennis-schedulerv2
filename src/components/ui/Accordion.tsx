import { ReactNode, useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import Typography from './Typography';

export interface AccordionItemProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function AccordionItem({ title, children, defaultOpen = false }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-neutral-200 rounded-lg overflow-hidden">
      <button
        type="button"
        className="w-full flex justify-between items-center px-4 py-3 bg-white hover:bg-neutral-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Typography weight="medium">{title}</Typography>
        <ChevronDownIcon
          className={`h-5 w-5 text-neutral-500 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
        />
      </button>
      
      {isOpen && (
        <div className="px-4 py-3 bg-white border-t border-neutral-200">
          {children}
        </div>
      )}
    </div>
  );
}

interface AccordionProps {
  children: ReactNode;
  className?: string;
}

/**
 * Accordion component that adheres to our design token system
 * Uses only semantic color tokens defined in tailwind.config.js
 */
export default function Accordion({ 
  children, 
  className = '' 
}: AccordionProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {children}
    </div>
  );
} 