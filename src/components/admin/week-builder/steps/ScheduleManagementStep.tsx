"use client";

import { CalendarIcon } from '@heroicons/react/24/outline';
import Typography from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import { GroupWithSchedule, GroupScheduleSlot, Location, CreateGroupScheduleSlotData } from '@/types';
import { groupScheduleService } from '@/lib/services/groupScheduleService';
import { TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

interface ScheduleManagementStepProps {
  groups: GroupWithSchedule[];
  locations: Location[];
  saving: boolean;
  onGroupsUpdate: (groups: GroupWithSchedule[]) => void;
  onSave: () => void;
  onPrevious: () => void;
}

export default function ScheduleManagementStep({
  groups,
  locations,
  saving,
  onGroupsUpdate,
  onSave,
  onPrevious
}: ScheduleManagementStepProps) {
  const [updatingSlot, setUpdatingSlot] = useState<string | null>(null);

  const days: Array<{ key: string; label: string }> = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
  ];

  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 6; hour <= 22; hour++) {
      for (let minutes = 0; minutes < 60; minutes += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        const displayTime = formatTimeDisplay(timeString);
        times.push({ value: timeString, label: displayTime });
      }
    }
    return times;
  };

  const formatTimeDisplay = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getGroupSlotsForDay = (groupId: string, day: string): GroupScheduleSlot[] => {
    const group = groups.find(g => g.id === groupId);
    return group?.scheduleSlots?.filter(slot => slot.day === day) || [];
  };

  const addTimeSlot = async (groupId: string, day: string) => {
    const slotKey = `${groupId}-${day}-add`;
    setUpdatingSlot(slotKey);

    try {
      const newSlotData: CreateGroupScheduleSlotData = {
        groupId,
        day: day as any,
        startTime: '09:00',
        endTime: '10:30',
      };

      const slotId = await groupScheduleService.create(newSlotData);
      
      // Create new slot object
      const newSlot: GroupScheduleSlot = {
        id: slotId,
        ...newSlotData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Update local state
      const updatedGroups = groups.map(group => 
        group.id === groupId 
          ? { ...group, scheduleSlots: [...(group.scheduleSlots || []), newSlot] }
          : group
      );
      onGroupsUpdate(updatedGroups);
    } catch (error) {
      console.error('Failed to add time slot:', error);
    } finally {
      setUpdatingSlot(null);
    }
  };

  const updateTimeSlot = async (
    slotId: string, 
    field: 'startTime' | 'endTime', 
    value: string
  ) => {
    const slotKey = `${slotId}-${field}`;
    setUpdatingSlot(slotKey);

    try {
      await groupScheduleService.update({
        id: slotId,
        [field]: value,
      });

      // Update local state immediately
      const updatedGroups = groups.map(group => ({
        ...group,
        scheduleSlots: group.scheduleSlots?.map(slot => 
          slot.id === slotId ? { ...slot, [field]: value } : slot
        ),
      }));
      onGroupsUpdate(updatedGroups);
    } catch (error) {
      console.error('Failed to update time slot:', error);
    } finally {
      setUpdatingSlot(null);
    }
  };

  const deleteTimeSlot = async (slotId: string) => {
    if (!confirm('Are you sure you want to delete this time slot?')) return;

    setUpdatingSlot(slotId);
    try {
      await groupScheduleService.delete(slotId);
      
      // Update local state immediately
      const updatedGroups = groups.map(group => ({
        ...group,
        scheduleSlots: group.scheduleSlots?.filter(slot => slot.id !== slotId),
      }));
      onGroupsUpdate(updatedGroups);
    } catch (error) {
      console.error('Failed to delete time slot:', error);
    } finally {
      setUpdatingSlot(null);
    }
  };

  const timeOptions = generateTimeOptions();

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center mb-6">
          <CalendarIcon className="h-6 w-6 text-primary-600 mr-3" />
          <div>
            <Typography variant="h2" weight="semibold">
              Step 4: Schedule Management
            </Typography>
            <Typography variant="small" className="text-neutral-600 mt-1">
              Set training times for each group for this week
            </Typography>
          </div>
        </div>

        {/* Group Schedule */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <Typography variant="h3" weight="medium" className="mb-1">
                Week Schedule
              </Typography>
              <Typography variant="small" className="text-neutral-600">
                Configure training times for each group. Groups can have multiple sessions per day.
              </Typography>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50">
                    <th className="text-left p-4 w-48">
                      <Typography weight="semibold" className="text-neutral-600">Group</Typography>
                    </th>
                    {days.map(day => (
                      <th key={day.key} className="text-center p-4 min-w-64">
                        <Typography weight="semibold" className="text-neutral-600">{day.label}</Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {groups.map(group => (
                    <tr 
                      key={group.id} 
                      className="border-b border-neutral-100 hover:bg-opacity-20"
                      style={{ 
                        backgroundColor: group.color ? `${group.color}15` : 'transparent' // 15 = ~8% opacity
                      }}
                    >
                      <td className="p-4 border-r border-neutral-100">
                        <div className="flex items-center space-x-3">
                          {group.color && (
                            <div 
                              className="w-4 h-4 rounded-full border border-neutral-300 flex-shrink-0"
                              style={{ backgroundColor: group.color }}
                            />
                          )}
                          <div>
                            <Typography weight="medium">{group.name}</Typography>
                            <Typography variant="small" className="text-neutral-600">
                              {group.size} players
                            </Typography>
                          </div>
                        </div>
                      </td>
                      {days.map(day => {
                        const daySlots = getGroupSlotsForDay(group.id, day.key);
                        return (
                          <td key={day.key} className="p-4 border-r border-neutral-100 align-top">
                            <div className="space-y-2">
                              {daySlots.map(slot => (
                                <div key={slot.id} className="bg-neutral-50 border border-neutral-200 rounded-lg p-3">
                                  <div className="grid grid-cols-2 gap-2 mb-2">
                                    <div>
                                      <Typography variant="small" className="text-neutral-600 mb-1">Start</Typography>
                                      <select
                                        value={slot.startTime}
                                        onChange={(e) => updateTimeSlot(slot.id, 'startTime', e.target.value)}
                                        disabled={updatingSlot === `${slot.id}-startTime`}
                                        className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50"
                                      >
                                        {timeOptions.map(option => (
                                          <option key={option.value} value={option.value}>
                                            {option.label}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    <div>
                                      <Typography variant="small" className="text-neutral-600 mb-1">End</Typography>
                                      <select
                                        value={slot.endTime}
                                        onChange={(e) => updateTimeSlot(slot.id, 'endTime', e.target.value)}
                                        disabled={updatingSlot === `${slot.id}-endTime`}
                                        className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50"
                                      >
                                        {timeOptions.map(option => (
                                          <option key={option.value} value={option.value}>
                                            {option.label}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>
                                  <div className="flex justify-end">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        deleteTimeSlot(slot.id);
                                      }}
                                      disabled={updatingSlot === slot.id}
                                      className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                                      type="button"
                                    >
                                      <TrashIcon className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  addTimeSlot(group.id, day.key);
                                }}
                                disabled={updatingSlot === `${group.id}-${day.key}-add`}
                                className="w-full"
                                type="button"
                              >
                                <PlusIcon className="h-4 w-4 mr-1" />
                                Add Time
                              </Button>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-neutral-50 p-4 rounded-lg">
            <Typography variant="small" className="text-neutral-600">
              <strong>Instructions:</strong> Set training times for each group using the time dropdowns. 
              You can add multiple sessions per day and assign locations to prevent conflicts. 
              Groups can have no training on certain days by leaving them empty.
            </Typography>
          </div>

          {/* Summary & Actions */}
          <div className="border-t pt-6 mt-6">
            <div className="flex items-center justify-between">
              <div>
                <Typography weight="medium">
                  Schedule configured for this week
                </Typography>
                <Typography variant="small" className="text-neutral-600 mt-1">
                  {groups.reduce((total, group) => total + (group.scheduleSlots?.length || 0), 0)} total training sessions scheduled
                </Typography>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={onPrevious}
                  disabled={saving}
                >
                  Previous
                </Button>
                <Button 
                  variant="primary" 
                  onClick={onSave}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Continue'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
} 