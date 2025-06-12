'use client';

import { usePathname } from 'next/navigation';

/**
 * MainContent component that adheres to our design token system
 * Uses only semantic tokens defined in tailwind.config.js
 */
export default function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDesignPage = pathname === '/design';

  return (
    <main 
      className={
        isDesignPage 
          ? "ml-64" // Offset for design page with sidebar
          : "container mx-auto px-4 py-8" // Regular pages
      }
    >
      {children}
    </main>
  );
} 