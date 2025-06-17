"use client";

import { CheckIcon } from '@heroicons/react/24/outline';
import Typography from '@/components/ui/Typography';

interface WeekBuilderStep {
  number: number;
  title: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
}

interface WeekBuilderSidebarProps {
  currentStep: number;
  onStepClick: (step: number) => void;
}

const STEPS: Omit<WeekBuilderStep, 'isCompleted' | 'isActive'>[] = [
  {
    number: 1,
    title: 'Assign Coaches',
    description: 'Select available coaches'
  },
  {
    number: 2,
    title: 'Groups',
    description: 'Size & preferences'
  },
  {
    number: 3,
    title: 'Locations',
    description: 'Assign locations'
  },
  {
    number: 4,
    title: 'Schedule',
    description: 'Time slots & availability'
  },
  {
    number: 5,
    title: 'Camps',
    description: 'Player counts'
  },
  {
    number: 6,
    title: 'Tournaments & Submit',
    description: 'Events & final submission'
  }
];

export default function WeekBuilderSidebar({ currentStep, onStepClick }: WeekBuilderSidebarProps) {
  const getStepClasses = (step: number) => {
    if (step === currentStep) {
      return 'bg-primary-50 border border-primary-200';
    }
    if (step < currentStep) {
      return 'bg-success-50 border border-success-200';
    }
    return 'hover:bg-neutral-50';
  };

  const getStepNumberClasses = (step: number) => {
    if (step === currentStep) {
      return 'bg-primary-600 text-white';
    }
    if (step < currentStep) {
      return 'bg-success-600 text-white';
    }
    return 'bg-neutral-300 text-neutral-600';
  };

  const getStepTextClasses = (step: number) => {
    if (step >= currentStep) {
      return 'text-neutral-900';
    }
    return 'text-neutral-500';
  };

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-6 sticky top-6">
      <Typography variant="h3" weight="semibold" className="mb-6">
        Schedule Building
      </Typography>
      
      <div className="space-y-4">
        {STEPS.map((stepConfig) => (
          <div 
            key={stepConfig.number}
            className={`flex items-start space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${getStepClasses(stepConfig.number)}`}
            onClick={() => onStepClick(stepConfig.number)}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${getStepNumberClasses(stepConfig.number)}`}>
              {stepConfig.number < currentStep ? (
                <CheckIcon className="h-4 w-4" />
              ) : (
                stepConfig.number
              )}
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <Typography 
                variant="small" 
                weight="medium" 
                className={getStepTextClasses(stepConfig.number)}
              >
                {stepConfig.title}
              </Typography>
              <Typography variant="small" className="text-neutral-500">
                {stepConfig.description}
              </Typography>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 