"use client";

import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import Typography from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import DataTable from '@/components/ui/DataTable';
import Dialog from '@/components/ui/Dialog';
import Badge from '@/components/ui/Badge';
import { Coach, CoachUnavailability, CreateCoachUnavailabilityData, TableColumn, CoachUnavailabilityWithCoach } from '@/types';
import { coachUnavailabilityService } from '@/lib/services/coachUnavailabilityService';
import { coachService } from '@/lib/services/coachService';

export default function UnavailabilityPage() {
  const [unavailabilities, setUnavailabilities] = useState<CoachUnavailabilityWithCoach[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUnavailability, setEditingUnavailability] = useState<CoachUnavailabilityWithCoach | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<CoachUnavailabilityWithCoach | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    coachId: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    isAllDay: false,
    reason: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [unavailabilityData, coachesData] = await Promise.all([
        coachUnavailabilityService.getAll(),
        coachService.getAll()
      ]);

      // Enhance unavailabilities with coach information
      const unavailabilitiesWithCoaches: CoachUnavailabilityWithCoach[] = unavailabilityData.map(unavailability => {
        const coach = coachesData.find(c => c.id === unavailability.coachId);
        return {
          ...unavailability,
          coach
        };
      });

      setUnavailabilities(unavailabilitiesWithCoaches);
      setCoaches(coachesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      coachId: '',
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      isAllDay: false,
      reason: ''
    });
  };

  const populateForm = (unavailability: CoachUnavailabilityWithCoach) => {
    setFormData({
      coachId: unavailability.coachId,
      startDate: unavailability.startDate.toISOString().split('T')[0],
      endDate: unavailability.endDate.toISOString().split('T')[0],
      startTime: unavailability.startTime || '',
      endTime: unavailability.endTime || '',
      isAllDay: unavailability.isAllDay,
      reason: unavailability.reason || ''
    });
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minutes = 0; minutes < 60; minutes += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        const display = new Date(`2000-01-01 ${timeString}`).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        options.push({ value: timeString, label: display });
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  const validateForm = () => {
    if (!formData.coachId || !formData.startDate || !formData.endDate) {
      alert('Please fill in all required fields');
      return false;
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      alert('Start date cannot be after end date');
      return false;
    }

    if (!formData.isAllDay && (!formData.startTime || !formData.endTime)) {
      alert('Please select start and end times, or check "All Day"');
      return false;
    }

    if (!formData.isAllDay && formData.startTime >= formData.endTime) {
      alert('Start time must be before end time');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setFormLoading(true);
      
      const unavailabilityData: CreateCoachUnavailabilityData = {
        coachId: formData.coachId,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        startTime: formData.isAllDay ? undefined : formData.startTime,
        endTime: formData.isAllDay ? undefined : formData.endTime,
        isAllDay: formData.isAllDay,
        reason: formData.reason || undefined
      };

      if (editingUnavailability) {
        await coachUnavailabilityService.update({
          id: editingUnavailability.id,
          ...unavailabilityData
        });
      } else {
        await coachUnavailabilityService.create(unavailabilityData);
      }

      setShowAddModal(false);
      setEditingUnavailability(null);
      resetForm();
      await loadData();
    } catch (error) {
      console.error('Failed to save unavailability:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (unavailability: CoachUnavailabilityWithCoach) => {
    try {
      await coachUnavailabilityService.delete(unavailability.id);
      setDeleteConfirm(null);
      await loadData();
    } catch (error) {
      console.error('Failed to delete unavailability:', error);
    }
  };

  const handleEdit = (unavailability: CoachUnavailabilityWithCoach) => {
    setEditingUnavailability(unavailability);
    populateForm(unavailability);
    setShowAddModal(true);
  };

  const handleAdd = () => {
    setEditingUnavailability(null);
    resetForm();
    setShowAddModal(true);
  };

  const formatDateRange = (startDate: Date, endDate: Date) => {
    const start = startDate.toLocaleDateString();
    const end = endDate.toLocaleDateString();
    return start === end ? start : `${start} - ${end}`;
  };

  const formatTimeRange = (startTime?: string, endTime?: string, isAllDay?: boolean) => {
    if (isAllDay) return 'All Day';
    if (!startTime || !endTime) return 'All Day';
    
    const formatTime = (time: string) => {
      return new Date(`2000-01-01 ${time}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    };
    
    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  };

  // Define table columns
  const columns: TableColumn<CoachUnavailabilityWithCoach>[] = [
    {
      key: 'coach',
      label: 'Coach',
      sortable: true,
      render: (value, unavailability) => (
        <div className="flex items-center">
          <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
            <Typography variant="small" weight="semibold" className="text-primary-700">
              {unavailability.coach?.name.charAt(0) || '?'}
            </Typography>
          </div>
          <div>
            <Typography weight="medium">{unavailability.coach?.name || 'Unknown Coach'}</Typography>
            <Typography variant="small" className="text-neutral-500">
              {unavailability.coach?.email}
            </Typography>
          </div>
        </div>
      )
    },
    {
      key: 'startDate',
      label: 'Dates',
      sortable: true,
      render: (value, unavailability) => (
        <div>
          <Typography weight="medium">
            {formatDateRange(unavailability.startDate, unavailability.endDate)}
          </Typography>
          <Typography variant="small" className="text-neutral-500">
            {formatTimeRange(unavailability.startTime, unavailability.endTime, unavailability.isAllDay)}
          </Typography>
        </div>
      )
    },
    {
      key: 'isAllDay',
      label: 'Type',
      sortable: true,
      render: (value) => (
        <Badge 
          variant={value ? 'secondary' : 'primary'}
          size="sm"
        >
          {value ? 'All Day' : 'Time Specific'}
        </Badge>
      )
    },
    {
      key: 'reason',
      label: 'Reason',
      sortable: false,
      render: (value) => (
        <Typography variant="small" className="text-neutral-600">
          {value || 'No reason provided'}
        </Typography>
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (value) => (
        <Typography variant="small" className="text-neutral-500">
          {new Date(value).toLocaleDateString()}
        </Typography>
      )
    }
  ];

  // Define row actions
  const rowActions = (unavailability: CoachUnavailabilityWithCoach) => (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleEdit(unavailability)}
      >
        <PencilIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="error"
        size="sm"
        onClick={() => setDeleteConfirm(unavailability)}
      >
        <TrashIcon className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <Typography variant="h1" weight="bold" className="mb-2">
            Coach Unavailability
          </Typography>
          <Typography variant="lead" className="text-neutral-600">
            Manage coach unavailability periods and time-off requests
          </Typography>
        </div>
        <Button
          variant="primary"
          onClick={handleAdd}
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Unavailability
        </Button>
      </div>

      {/* Unavailability Table */}
      <DataTable
        data={unavailabilities}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search unavailability records..."
        actions={rowActions}
        emptyMessage="No unavailability records found. Add the first one to get started."
      />

      {/* Add/Edit Modal */}
      <Dialog
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingUnavailability(null);
          resetForm();
        }}
        title={editingUnavailability ? "Edit Unavailability" : "Add Unavailability"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Coach Selection */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Coach *
            </label>
            <select
              value={formData.coachId}
              onChange={(e) => setFormData(prev => ({ ...prev, coachId: e.target.value }))}
              className="w-full border border-neutral-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
              required
            >
              <option value="">Select a coach</option>
              {coaches.map(coach => (
                <option key={coach.id} value={coach.id}>
                  {coach.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full border border-neutral-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                End Date *
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full border border-neutral-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
          </div>

          {/* All Day Toggle */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isAllDay"
              checked={formData.isAllDay}
              onChange={(e) => setFormData(prev => ({ ...prev, isAllDay: e.target.checked }))}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
            />
            <label htmlFor="isAllDay" className="ml-2 block text-sm text-neutral-700">
              All Day
            </label>
          </div>

          {/* Time Range (only if not all day) */}
          {!formData.isAllDay && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Start Time *
                </label>
                <select
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  className="w-full border border-neutral-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                  required={!formData.isAllDay}
                >
                  <option value="">Select start time</option>
                  {timeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  End Time *
                </label>
                <select
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  className="w-full border border-neutral-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                  required={!formData.isAllDay}
                >
                  <option value="">Select end time</option>
                  {timeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Reason (Optional)
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              className="w-full border border-neutral-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
              rows={3}
              placeholder="Vacation, sick leave, personal appointment, etc."
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAddModal(false);
                setEditingUnavailability(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={formLoading}
            >
              {formLoading ? 'Saving...' : (editingUnavailability ? 'Update' : 'Add')} Unavailability
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Unavailability"
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
            >
              Cancel
            </Button>
            <Button
              variant="error"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              Delete
            </Button>
          </>
        }
      >
        <div className="py-4">
          <Typography className="mb-4">
            Are you sure you want to delete this unavailability period for <strong>{deleteConfirm?.coach?.name}</strong>?
          </Typography>
          <Typography variant="small" className="text-neutral-500">
            {deleteConfirm && formatDateRange(deleteConfirm.startDate, deleteConfirm.endDate)} - {deleteConfirm && formatTimeRange(deleteConfirm.startTime, deleteConfirm.endTime, deleteConfirm.isAllDay)}
          </Typography>
          <Typography variant="small" className="text-neutral-500 mt-2">
            This action cannot be undone.
          </Typography>
        </div>
      </Dialog>
    </div>
  );
} 