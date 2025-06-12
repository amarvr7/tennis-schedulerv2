"use client";

import Link from 'next/link';
import Typography from './Typography';
import { useState, useEffect } from 'react';

/**
 * AdminSidebar component that adheres to our design token system
 * Uses only semantic color tokens defined in tailwind.config.js
 * Now with enhanced mobile responsiveness
 */
export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive behavior based on window size
  useEffect(() => {
    const handleResize = () => {
      const mobileView = window.innerWidth < 768;
      setIsMobile(mobileView);
      
      // Auto-collapse only on mobile screens
      if (mobileView) {
        setCollapsed(true);
      } else {
        // Ensure it's not collapsed by default on desktop
        setCollapsed(false);
      }
    };

    // Set initial state
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <>
      {/* Mobile overlay when sidebar is open */}
      {isMobile && !collapsed && (
        <div 
          className="fixed inset-0 bg-neutral-900/50 z-20"
          onClick={() => setCollapsed(true)}
          aria-hidden="true"
        />
      )}
    
      <aside 
        className={`bg-neutral-100 overflow-y-auto shrink-0 flex flex-col transition-all duration-300 z-30 ${
          isMobile 
            ? `fixed h-full ${collapsed ? '-translate-x-full' : 'w-64'}`
            : `relative ${collapsed ? 'w-20' : 'w-64'}`
        }`}
      >
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
          {(!collapsed || !isMobile) && (
            <Typography variant="h5" weight="bold" className={`text-neutral-800 ${collapsed && !isMobile ? 'hidden' : ''}`}>
              Admin Panel
            </Typography>
          )}
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded hover:bg-neutral-200 text-neutral-700 transition-colors"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="13 17 18 12 13 7"></polyline>
                <polyline points="6 17 11 12 6 7"></polyline>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="11 17 6 12 11 7"></polyline>
                <polyline points="18 17 13 12 18 7"></polyline>
              </svg>
            )}
          </button>
        </div>
        <nav className="p-4 flex-grow">
          <ul className="space-y-2">
            <li>
              <Link 
                href="/admin" 
                className="block p-2 rounded hover:bg-neutral-200 transition-colors flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                {(!collapsed || !isMobile) && (
                  <Typography className={`text-neutral-700 ml-2 ${collapsed && !isMobile ? 'hidden' : ''}`}>Dashboard</Typography>
                )}
              </Link>
            </li>
            {/* Add more admin navigation items as needed */}
          </ul>
        </nav>
        
        {/* Development navigation links at bottom */}
        {(!collapsed || !isMobile) && (
          <div className={`p-4 border-t border-neutral-200 ${collapsed && !isMobile ? 'hidden' : ''}`}>
            <Typography variant="small" className="text-neutral-500 mb-2">
              Quick Navigation
            </Typography>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/" 
                  className="block p-2 rounded hover:bg-neutral-200 transition-colors flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                  <Typography className="text-neutral-700 ml-2">Main Site</Typography>
                </Link>
              </li>
              <li>
                <Link 
                  href="/design" 
                  className="block p-2 rounded hover:bg-neutral-200 transition-colors flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                    <path d="M2 17l10 5 10-5"></path>
                    <path d="M2 12l10 5 10-5"></path>
                  </svg>
                  <Typography className="text-neutral-700 ml-2">Design System</Typography>
                </Link>
              </li>
            </ul>
          </div>
        )}
      </aside>
      
      {/* Mobile toggle button fixed to the corner when sidebar is closed */}
      {isMobile && collapsed && (
        <button
          onClick={toggleSidebar}
          className="fixed z-20 bottom-4 right-4 bg-primary-600 text-white p-3 rounded-full shadow-lg hover:bg-primary-700 transition-colors"
          aria-label="Open menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      )}
    </>
  );
} 