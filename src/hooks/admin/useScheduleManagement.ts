import { useState } from 'react';
import { ScheduleSlot } from '@/types';

export function useScheduleManagement(scheduleTemplate: ScheduleSlot[]) {
  const [weekSchedule, setWeekSchedule] = useState<ScheduleSlot[]>([]);
  const [updatingSlot, setUpdatingSlot] = useState<string | null>(null);

  // Initialize schedule with template
  const initializeSchedule = () => {
    if (scheduleTemplate.length > 0 && weekSchedule.length === 0) {
      setWeekSchedule([...scheduleTemplate]);
    }
  };

  const toggleSlot = (day: string, timeSlot: string) => {
    setWeekSchedule(prev => 
      prev.map(slot => {
        if (slot.day === day && slot.timeSlot === timeSlot) {
          return { ...slot, isActive: !slot.isActive };
        }
        return slot;
      })
    );
  };

  const resetToTemplate = () => {
    setWeekSchedule([...scheduleTemplate]);
  };

  const clearAll = () => {
    setWeekSchedule(prev => prev.map(slot => ({ ...slot, isActive: false })));
  };

  const setAll = () => {
    setWeekSchedule(prev => prev.map(slot => ({ ...slot, isActive: true })));
  };

  return {
    weekSchedule,
    setWeekSchedule,
    updatingSlot,
    setUpdatingSlot,
    initializeSchedule,
    toggleSlot,
    resetToTemplate,
    clearAll,
    setAll,
  };
} 