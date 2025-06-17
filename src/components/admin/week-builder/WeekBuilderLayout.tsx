"use client";

import { ReactNode } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Typography from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import { Week } from '@/types';

interface WeekBuilderLayoutProps {
  week: Week | null;
  sidebar: ReactNode;
  children: ReactNode;
  onBack: () => void;
}

export default function WeekBuilderLayout({ 
  week, 
  sidebar, 
  children, 
  onBack 
}: WeekBuilderLayoutProps) {
  if (!week) {
    return (
      <div className="text-center py-12">
        <Typography variant="h2" className="mb-4">Week not found</Typography>
        <Button variant="outline" onClick={onBack}>
          Back to Weeks
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Weeks
          </Button>
          <div>
            <Typography variant="h1" weight="bold">
              {week.name}
            </Typography>
            <Typography variant="small" className="text-neutral-500">
              {week.startDate.toLocaleDateString()} - {week.endDate.toLocaleDateString()}
            </Typography>
          </div>
        </div>
      </div>

      {/* Main Layout with Sidebar */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Sidebar - Steps */}
        <div className="col-span-3">
          {sidebar}
        </div>

        {/* Main Content Area */}
        <div className="col-span-9">
          {children}
        </div>
      </div>
    </div>
  );
} 