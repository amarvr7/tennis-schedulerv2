"use client";

import { useState, useEffect } from 'react';
import Typography from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import { ScheduleSlot } from '@/types';
import { scheduleService } from '@/lib/services/scheduleService';

export default function SchedulePage() {
  const [scheduleSlots, setScheduleSlots] = useState<ScheduleSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Generate time slots (6 AM to 10 PM in 30-minute intervals)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour <= 21; hour++) {
      for (let minutes = 0; minutes < 60; minutes += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      const slots = await scheduleService.getAll();
      setScheduleSlots(slots);
    } catch (error) {
      console.error('Failed to load schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const findSlot = (day: string, timeSlot: string): ScheduleSlot | undefined => {
    return scheduleSlots.find(slot => slot.day === day && slot.timeSlot === timeSlot);
  };

  const isSlotActive = (day: string, timeSlot: string): boolean => {
    const slot = findSlot(day, timeSlot);
    return slot?.isActive || false;
  };

  const toggleSlot = async (day: string, timeSlot: string) => {
    const slotKey = `${day}-${timeSlot}`;
    setUpdating(slotKey);

    try {
      const existingSlot = findSlot(day, timeSlot);
      
      if (existingSlot) {
        // Optimistically update existing slot
        const newIsActive = !existingSlot.isActive;
        const updatedSlot = { ...existingSlot, isActive: newIsActive };
        
        // Update local state immediately
        setScheduleSlots(prev => 
          prev.map(slot => slot.id === existingSlot.id ? updatedSlot : slot)
        );
        
        // Update database in background
        await scheduleService.update({
          id: existingSlot.id,
          isActive: newIsActive
        });
      } else {
        // Create new slot optimistically
        const newSlot: ScheduleSlot = {
          id: `temp-${Date.now()}`, // Temporary ID
          day,
          timeSlot,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // Update local state immediately
        setScheduleSlots(prev => [...prev, newSlot]);
        
        // Create in database and update with real ID
        const realId = await scheduleService.create({
          day,
          timeSlot,
          isActive: true
        });
        
        // Update local state with real ID
        setScheduleSlots(prev => 
          prev.map(slot => slot.id === newSlot.id ? { ...slot, id: realId } : slot)
        );
      }
    } catch (error) {
      console.error('Failed to toggle slot:', error);
      // Reload data on error as fallback
      await loadSchedule();
    } finally {
      setUpdating(null);
    }
  };

  const formatTimeDisplay = (timeSlot: string) => {
    const [hours, minutes] = timeSlot.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const clearAllSlots = async () => {
    if (!confirm('Are you sure you want to clear all active time slots?')) {
      return;
    }

    try {
      setLoading(true);
      const activeSlots = scheduleSlots.filter(slot => slot.isActive);
      await Promise.all(activeSlots.map(slot => 
        scheduleService.update({ id: slot.id, isActive: false })
      ));
      await loadSchedule();
    } catch (error) {
      console.error('Failed to clear slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const setAllSlots = async () => {
    if (!confirm('Are you sure you want to activate all time slots?')) {
      return;
    }

    try {
      setLoading(true);
      
      // Create all possible slots as active
      const allSlots = [];
      for (const day of days) {
        for (const timeSlot of timeSlots) {
          allSlots.push({ day, timeSlot, isActive: true });
        }
      }

      // Clear existing slots and create new ones
      await Promise.all(scheduleSlots.map(slot => scheduleService.delete(slot.id)));
      await Promise.all(allSlots.map(slot => scheduleService.create(slot)));
      await loadSchedule();
    } catch (error) {
      console.error('Failed to set all slots:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Typography>Loading schedule...</Typography>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Typography variant="h1" weight="bold" className="mb-2">
            Schedule Template
          </Typography>
          <Typography variant="lead" className="text-neutral-600">
            Set the baseline availability for scheduling. Click cells to toggle time slots on/off.
          </Typography>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllSlots}
            disabled={loading}
          >
            Clear All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={setAllSlots}
            disabled={loading}
          >
            Set All
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Header */}
            <div className="grid grid-cols-8 bg-neutral-50 border-b border-neutral-200">
              <div className="p-3 text-right">
                <Typography weight="semibold" className="text-neutral-600">Time</Typography>
              </div>
              {dayLabels.map((dayLabel, index) => (
                <div key={dayLabel} className="p-3 text-center border-l border-neutral-200">
                  <Typography weight="semibold" className="text-neutral-600">{dayLabel}</Typography>
                </div>
              ))}
            </div>

            {/* Time slots grid */}
            <div className="divide-y divide-neutral-100">
              {timeSlots.map((timeSlot) => (
                <div key={timeSlot} className="grid grid-cols-8 hover:bg-neutral-25">
                  <div className="p-3 text-right border-r border-neutral-100 bg-neutral-50/50">
                    <Typography variant="small" className="text-neutral-600 font-mono">
                      {formatTimeDisplay(timeSlot)}
                    </Typography>
                  </div>
                  {days.map((day, dayIndex) => {
                    const isActive = isSlotActive(day, timeSlot);
                    const slotKey = `${day}-${timeSlot}`;
                    const isUpdating = updating === slotKey;
                    
                    return (
                      <div key={day} className="border-l border-neutral-100">
                        <button
                          onClick={() => toggleSlot(day, timeSlot)}
                          disabled={isUpdating}
                          className={`w-full h-12 flex items-center justify-center transition-colors ${
                            isActive 
                              ? 'bg-primary-100 hover:bg-primary-200' 
                              : 'hover:bg-neutral-100'
                          } ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          aria-label={`${isActive ? 'Deactivate' : 'Activate'} ${formatTimeDisplay(timeSlot)} on ${day}`}
                        >
                          {isUpdating ? (
                            <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                          ) : isActive ? (
                            <div className="w-3 h-3 bg-primary-600 rounded-full" />
                          ) : (
                            <div className="w-3 h-3 border-2 border-neutral-300 rounded-full" />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-neutral-50 p-4 rounded-lg">
        <Typography variant="small" className="text-neutral-600">
          <strong>Legend:</strong> 
          <span className="inline-flex items-center ml-2 mr-4">
            <div className="w-3 h-3 bg-primary-600 rounded-full mr-2" />
            Active slot
          </span>
          <span className="inline-flex items-center">
            <div className="w-3 h-3 border-2 border-neutral-300 rounded-full mr-2" />
            Inactive slot
          </span>
        </Typography>
      </div>
    </div>
  );
} 