"use client";

import { useState, useEffect } from 'react';
import Typography from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import { GroupWithSchedule, GroupScheduleSlot, Location, CreateGroupScheduleSlotData } from '@/types';
import { groupService } from '@/lib/services/groupService';
import { locationService } from '@/lib/services/locationService';
import { groupScheduleService } from '@/lib/services/groupScheduleService';
import { TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function SchedulePage() {
  const [groups, setGroups] = useState<GroupWithSchedule[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const days: Array<{ key: string; label: string }> = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [groupsData, locationsData, scheduleData] = await Promise.all([
        groupService.getAll(),
        locationService.getAll(),
        groupScheduleService.getAll(),
      ]);

      // Enhance groups with their schedule slots
      const groupsWithSchedule: GroupWithSchedule[] = groupsData.map(group => ({
        ...group,
        scheduleSlots: scheduleData.filter(slot => slot.groupId === group.id),
      }));

      setGroups(groupsWithSchedule);
      setLocations(locationsData);
    } catch (error) {
      console.error('Failed to load schedule data:', error);
    } finally {
      setLoading(false);
    }
  };

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
    setSaving(slotKey);

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

      // Update local state immediately instead of reloading
      setGroups(prevGroups => 
        prevGroups.map(group => 
          group.id === groupId 
            ? { ...group, scheduleSlots: [...(group.scheduleSlots || []), newSlot] }
            : group
        )
      );
    } catch (error) {
      console.error('Failed to add time slot:', error);
    } finally {
      setSaving(null);
    }
  };

  const updateTimeSlot = async (
    slotId: string, 
    field: 'startTime' | 'endTime', 
    value: string
  ) => {
    const slotKey = `${slotId}-${field}`;
    setSaving(slotKey);

    try {
      await groupScheduleService.update({
        id: slotId,
        [field]: value,
      });

      // Update local state immediately
      setGroups(prevGroups => 
        prevGroups.map(group => ({
          ...group,
          scheduleSlots: group.scheduleSlots?.map(slot => 
            slot.id === slotId ? { ...slot, [field]: value } : slot
          ),
        }))
      );
    } catch (error) {
      console.error('Failed to update time slot:', error);
    } finally {
      setSaving(null);
    }
  };

  const deleteTimeSlot = async (slotId: string) => {
    if (!confirm('Are you sure you want to delete this time slot?')) return;

    setSaving(slotId);
    try {
      await groupScheduleService.delete(slotId);
      
      // Update local state immediately
      setGroups(prevGroups => 
        prevGroups.map(group => ({
          ...group,
          scheduleSlots: group.scheduleSlots?.filter(slot => slot.id !== slotId),
        }))
      );
    } catch (error) {
      console.error('Failed to delete time slot:', error);
    } finally {
      setSaving(null);
    }
  };

  const timeOptions = generateTimeOptions();

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
            Group Schedule
          </Typography>
          <Typography variant="lead" className="text-neutral-600">
            Set training times for each group. Times can be customized per day and multiple sessions per day are supported.
          </Typography>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
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
                                    disabled={saving === `${slot.id}-startTime`}
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
                                    disabled={saving === `${slot.id}-endTime`}
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
                                  disabled={saving === slot.id}
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
                            disabled={saving === `${group.id}-${day.key}-add`}
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
      </Card>

      <div className="bg-neutral-50 p-4 rounded-lg">
        <Typography variant="small" className="text-neutral-600">
          <strong>Instructions:</strong> Use the time dropdowns to set start and end times for each group&apos;s training sessions. 
          You can add multiple time slots per day. Groups can have no training on certain days by leaving them empty.
        </Typography>
      </div>
    </div>
  );
} 