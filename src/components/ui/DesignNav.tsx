"use client";

import { useMediaQuery } from 'react-responsive';
import { useCallback } from 'react';
import Typography from './Typography';

// Navigation items for the sidebar/topbar
const navigationItems = [
  { id: 'typography', label: 'Typography' },
  { id: 'colors', label: 'Colors' },
  { id: 'cards', label: 'Card' },
  { id: 'dialogs', label: 'Modal/Dialog' },
  { id: 'toasts', label: 'Toast/Notification' },
  { id: 'alerts', label: 'Alert/Banner' },
  { id: 'buttons', label: 'Buttons' },
  { id: 'form-controls', label: 'Form Controls' },
  { id: 'avatars', label: 'Avatar' },
  { id: 'badges', label: 'Badge/Tag' },
  { id: 'accordions', label: 'Accordion' },
  { id: 'tabs', label: 'Tabs' },
  { id: 'tooltips', label: 'Tooltip' },
];

/**
 * DesignNav component that adheres to our design token system
 * Uses only semantic color tokens and typography components
 */
export default function DesignNav() {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  // Handle click on navigation item
  const handleNavClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      // Scroll to the element with a small offset from the top
      window.scrollTo({
        top: element.offsetTop - 20,
        behavior: 'smooth'
      });
    }
  }, []);

  return (
    <div className={`${isMobile ? 'sticky top-0 bg-white z-30 border-b' : 'h-full w-64 border-r bg-neutral-50 overflow-y-auto'}`}>
      <div className="p-4">
        <Typography variant="h4" weight="bold" className="mb-6">UI Components</Typography>
        <nav className={`${isMobile ? 'flex overflow-x-auto pb-2 -mx-4 px-4' : 'flex flex-col space-y-2'}`}>
          {navigationItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => handleNavClick(e, item.id)}
              className={`${isMobile ? 'flex-shrink-0 px-3 py-2 mr-2 whitespace-nowrap' : 'px-3 py-2'} text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors cursor-pointer`}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
} 