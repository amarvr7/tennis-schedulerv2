import { ReactNode, useState } from 'react';
import Typography from './Typography';

interface TabProps {
  label: string;
  children: ReactNode;
}

export function Tab({ children }: TabProps) {
  return <div className="py-3">{children}</div>;
}

interface TabsProps {
  children: ReactNode[];
  variant?: 'default' | 'pills' | 'underline';
  defaultTab?: number;
  className?: string;
}

/**
 * Tabs component that adheres to our design token system
 * Uses only semantic color tokens defined in tailwind.config.js
 */
export default function Tabs({
  children,
  variant = 'default',
  defaultTab = 0,
  className = '',
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const tabs = children as ReactNode[];
  
  // Extract labels from Tab components
  const tabLabels = tabs.map((tab) => {
    // Type assertion to access props safely
    const tabElement = tab as React.ReactElement<TabProps>;
    return tabElement.props.label;
  });
  
  const getTabStyles = (index: number) => {
    const isActive = index === activeTab;
    
    switch(variant) {
      case 'pills':
        return isActive
          ? 'bg-primary-500 text-white'
          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200';
        
      case 'underline':
        return isActive
          ? 'text-primary-700 border-b-2 border-primary-500'
          : 'text-neutral-600 border-b-2 border-transparent hover:text-primary-600 hover:border-primary-200';
        
      default: // default variant
        return isActive
          ? 'text-primary-700 font-medium border-b-2 border-primary-500'
          : 'text-neutral-600 border-b-2 border-transparent hover:text-primary-500 hover:border-primary-200';
    }
  };
  
  return (
    <div className={className}>
      {/* Tab Navigation */}
      <div className={`flex space-x-2 ${variant === 'underline' ? 'border-b border-neutral-200' : ''}`}>
        {tabLabels.map((label, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`
              px-4 py-2 font-medium text-sm transition-colors
              ${getTabStyles(index)}
              ${variant === 'pills' ? 'rounded-md' : ''}
            `}
          >
            <Typography 
              variant="small" 
              weight={index === activeTab ? 'medium' : 'normal'}
              className={index === activeTab && variant === 'pills' ? 'text-white' : ''}
            >
              {label}
            </Typography>
          </button>
        ))}
      </div>
      
      {/* Tab Content */}
      <div className="mt-4">
        {tabs[activeTab]}
      </div>
    </div>
  );
} 