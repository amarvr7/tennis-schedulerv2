"use client";

import { useState } from 'react';
import { AcademicCapIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import Typography from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Camp, Week } from '@/types';

interface CampManagementStepProps {
  weekCamp: Camp | null;
  week: Week;
  editingCamp: boolean;
  saving: boolean;
  onCreateCamp: () => void;
  onEditCamp: () => void;
  onSaveCamp: (campData: Partial<Camp>) => void;
  onDeleteCamp: () => void;
  onCancelEdit: () => void;
  onSave: () => void;
  onPrevious: () => void;
}

export default function CampManagementStep({
  weekCamp,
  week,
  editingCamp,
  saving,
  onCreateCamp,
  onEditCamp,
  onSaveCamp,
  onDeleteCamp,
  onCancelEdit,
  onSave,
  onPrevious
}: CampManagementStepProps) {

  const getWeekDays = (): Array<{date: string, dayName: string, displayDate: string}> => {
    const days = [];
    const start = new Date(week.startDate);
    const end = new Date(week.endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD format
      const dayName = d.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const displayDate = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      
      days.push({
        date: dateStr,
        dayName,
        displayDate
      });
    }
    
    return days;
  };

  const getTotalAdultPlayers = (adultPlayers: { [day: string]: number }) => {
    return Object.values(adultPlayers).reduce((sum, count) => sum + count, 0);
  };

  if (!weekCamp) {
    return (
      <Card>
        <div className="p-6">
          <div className="flex items-center mb-6">
            <AcademicCapIcon className="h-6 w-6 text-primary-600 mr-3" />
            <div>
              <Typography variant="h2" weight="semibold">
                Step 5: Camps
              </Typography>
              <Typography variant="small" className="text-neutral-600 mt-1">
                Review and manage camp details for this week
              </Typography>
            </div>
          </div>

          <div className="text-center py-12 bg-neutral-50 rounded-lg">
            <AcademicCapIcon className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            <Typography variant="h3" weight="medium" className="mb-2">
              No Camp Created
            </Typography>
            <Typography className="text-neutral-500 mb-6">
              Create a camp for this week to manage junior and adult player counts.
            </Typography>
            <Button
              variant="primary"
              onClick={onCreateCamp}
              disabled={saving}
            >
              {saving ? 'Creating...' : 'Create Camp'}
            </Button>
          </div>

          {/* Navigation */}
          <div className="border-t pt-6 mt-6">
            <div className="flex items-center justify-between">
              <div>
                <Typography weight="medium">Camp Required</Typography>
                <Typography variant="small" className="text-neutral-500 mt-1">
                  Create a camp before proceeding to the next step
                </Typography>
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" onClick={onPrevious}>
                  Back to Schedule
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center mb-6">
          <AcademicCapIcon className="h-6 w-6 text-primary-600 mr-3" />
          <div>
            <Typography variant="h2" weight="semibold">
              Step 5: Camps
            </Typography>
            <Typography variant="small" className="text-neutral-600 mt-1">
              Review and manage camp details for this week
            </Typography>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <Typography variant="h3" weight="medium" className="mb-1">
                  Camp Details
                </Typography>
                <Typography variant="small" className="text-neutral-600">
                  {week.name} ({new Date(week.startDate).toLocaleDateString()} - {new Date(week.endDate).toLocaleDateString()})
                </Typography>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={editingCamp ? onCancelEdit : onEditCamp}
                  disabled={saving}
                >
                  {editingCamp ? 'Cancel Edit' : 'Edit Camp'}
                </Button>
                <Button
                  variant="error"
                  size="sm"
                  onClick={onDeleteCamp}
                  disabled={saving}
                >
                  Delete Camp
                </Button>
              </div>
            </div>

            {editingCamp ? (
              <CampEditForm 
                camp={weekCamp}
                weekDays={getWeekDays()}
                onSave={onSaveCamp}
                onCancel={onCancelEdit}
                loading={saving}
              />
            ) : (
              <CampSummary 
                camp={weekCamp}
                weekDays={getWeekDays()}
              />
            )}
          </div>

          {/* Final Actions */}
          <div className="border-t pt-6 mt-6">
            <div className="flex items-center justify-between">
              <div>
                <Typography weight="medium">
                  Ready to Continue
                </Typography>
                <Typography variant="small" className="text-neutral-500 mt-1">
                  Camp configured with {weekCamp.juniorPlayers} juniors and {getTotalAdultPlayers(weekCamp.adultPlayers)} adults total
                </Typography>
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={onPrevious}
                >
                  Back to Schedule
                </Button>
                <Button
                  variant="primary"
                  onClick={onSave}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save & Continue'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Separate Camp Summary Component (previously inline)
function CampSummary({ camp, weekDays }: { 
  camp: Camp; 
  weekDays: Array<{date: string, dayName: string, displayDate: string}>;
}) {
  const getTotalAdultPlayers = (adultPlayers: { [day: string]: number }) => {
    return Object.values(adultPlayers).reduce((sum, count) => sum + count, 0);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Junior Players */}
      <div className="bg-primary-50 p-4 rounded-lg">
        <div className="flex items-center mb-2">
          <UserGroupIcon className="h-5 w-5 text-primary-600 mr-2" />
          <Typography weight="medium" className="text-primary-900">Junior Players</Typography>
        </div>
        <Typography variant="h2" weight="bold" className="text-primary-900">
          {camp.juniorPlayers}
        </Typography>
        <Typography variant="small" className="text-primary-700">
          For the entire week
        </Typography>
      </div>

      {/* Adult Players */}
      <div className="bg-secondary-50 p-4 rounded-lg">
        <div className="flex items-center mb-2">
          <UserGroupIcon className="h-5 w-5 text-secondary-600 mr-2" />
          <Typography weight="medium" className="text-secondary-900">Adult Players</Typography>
        </div>
        <Typography variant="h2" weight="bold" className="text-secondary-900">
          {getTotalAdultPlayers(camp.adultPlayers)}
        </Typography>
        <Typography variant="small" className="text-secondary-700">
          Total across all days
        </Typography>
      </div>

      {/* Daily Breakdown */}
      <div className="md:col-span-2">
        <Typography weight="medium" className="mb-3">Daily Adult Players</Typography>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {weekDays.map(dayInfo => (
            <div key={dayInfo.date} className="text-center p-3 bg-neutral-50 rounded">
              <Typography variant="small" weight="medium" className="block mb-1">
                {dayInfo.displayDate}
              </Typography>
              <Typography variant="small" className="text-neutral-600">
                {camp.adultPlayers[dayInfo.date] || 0} adults
              </Typography>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Separate Camp Edit Form Component (previously inline)
function CampEditForm({ 
  camp, 
  weekDays, 
  onSave, 
  onCancel, 
  loading 
}: { 
  camp: Camp; 
  weekDays: Array<{date: string, dayName: string, displayDate: string}>;
  onSave: (data: Partial<Camp>) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [formData, setFormData] = useState({
    juniorPlayers: camp.juniorPlayers,
    adultPlayers: { ...camp.adultPlayers }
  });

  const handleAdultPlayerChange = (date: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      adultPlayers: {
        ...prev.adultPlayers,
        [date]: value
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Junior Players */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Junior Players (Whole Week) *
        </label>
        <input
          type="number"
          min="0"
          value={formData.juniorPlayers}
          onChange={(e) => setFormData(prev => ({ ...prev, juniorPlayers: parseInt(e.target.value) || 0 }))}
          className="w-full border border-neutral-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
          disabled={loading}
          required
        />
      </div>

      {/* Adult Players by Day */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-3">
          Adult Players (Daily Count)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {weekDays.map(dayInfo => (
            <div key={dayInfo.date} className="flex items-center space-x-3 p-3 bg-neutral-50 rounded-md">
              <div className="w-32 flex-shrink-0">
                <Typography variant="small" weight="medium">
                  {dayInfo.displayDate}
                </Typography>
              </div>
              <input
                type="number"
                min="0"
                value={formData.adultPlayers[dayInfo.date] || 0}
                onChange={(e) => handleAdultPlayerChange(dayInfo.date, parseInt(e.target.value) || 0)}
                className="w-20 border border-neutral-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500 text-center"
                disabled={loading}
              />
              <Typography variant="small" className="text-neutral-500">
                adults
              </Typography>
            </div>
          ))}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Camp'}
        </Button>
      </div>
    </form>
  );
} 