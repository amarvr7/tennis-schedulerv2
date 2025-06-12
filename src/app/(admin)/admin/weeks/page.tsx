"use client";

import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, CalendarIcon } from '@heroicons/react/24/outline';
import Typography from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import DataTable from '@/components/ui/DataTable';
import Dialog from '@/components/ui/Dialog';
import { Week, CreateWeekData, TableColumn } from '@/types';
import { weekService } from '@/lib/services/weekService';

export default function WeeksPage() {
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingWeek, setEditingWeek] = useState<Week | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Week | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    loadWeeks();
  }, []);

  const loadWeeks = async () => {
    try {
      setLoading(true);
      const weeksData = await weekService.getAll();
      setWeeks(weeksData);
    } catch (error) {
      console.error('Failed to load weeks:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      startDate: '',
      endDate: ''
    });
  };

  const populateForm = (week: Week) => {
    setFormData({
      name: week.name,
      startDate: week.startDate.toISOString().split('T')[0],
      endDate: week.endDate.toISOString().split('T')[0]
    });
  };

  const validateForm = () => {
    if (!formData.name.trim() || !formData.startDate || !formData.endDate) {
      alert('Please fill in all fields');
      return false;
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      alert('Start date cannot be after end date');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setFormLoading(true);
      
      // Parse dates as local dates to avoid timezone issues
      const [startYear, startMonth, startDay] = formData.startDate.split('-').map(Number);
      const [endYear, endMonth, endDay] = formData.endDate.split('-').map(Number);
      
      const weekData: CreateWeekData = {
        name: formData.name.trim(),
        startDate: new Date(startYear, startMonth - 1, startDay), // month is 0-indexed
        endDate: new Date(endYear, endMonth - 1, endDay)
      };

      if (editingWeek) {
        await weekService.update({
          id: editingWeek.id,
          ...weekData
        });
      } else {
        await weekService.create(weekData);
      }

      setShowAddModal(false);
      setEditingWeek(null);
      resetForm();
      await loadWeeks();
    } catch (error) {
      console.error('Failed to save week:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (week: Week) => {
    try {
      await weekService.delete(week.id);
      setDeleteConfirm(null);
      await loadWeeks();
    } catch (error) {
      console.error('Failed to delete week:', error);
    }
  };

  const handleEdit = (week: Week) => {
    setEditingWeek(week);
    populateForm(week);
    setShowAddModal(true);
  };

  const handleAdd = () => {
    setEditingWeek(null);
    resetForm();
    setShowAddModal(true);
  };

  const formatDateRange = (startDate: Date, endDate: Date) => {
    const start = startDate.toLocaleDateString();
    const end = endDate.toLocaleDateString();
    return `${start} - ${end}`;
  };

  const calculateDuration = (startDate: Date, endDate: Date) => {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
    return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  };

  // Define table columns
  const columns: TableColumn<Week>[] = [
    {
      key: 'name',
      label: 'Week Name',
      sortable: true,
      render: (value) => (
        <div className="flex items-center">
          <CalendarIcon className="h-5 w-5 text-neutral-400 mr-2" />
          <Typography weight="medium">{value}</Typography>
        </div>
      )
    },
    {
      key: 'startDate',
      label: 'Date Range',
      sortable: true,
      render: (value, week) => (
        <div>
          <Typography weight="medium">
            {formatDateRange(week.startDate, week.endDate)}
          </Typography>
          <Typography variant="small" className="text-neutral-500">
            {calculateDuration(week.startDate, week.endDate)}
          </Typography>
        </div>
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
  const rowActions = (week: Week) => (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleEdit(week)}
      >
        <PencilIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="error"
        size="sm"
        onClick={() => setDeleteConfirm(week)}
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
            Weeks
          </Typography>
          <Typography variant="lead" className="text-neutral-600">
            Manage scheduling weeks and time periods
          </Typography>
        </div>
        <Button
          variant="primary"
          onClick={handleAdd}
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Week
        </Button>
      </div>

      {/* Weeks Table */}
      <DataTable
        data={weeks}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search weeks..."
        actions={rowActions}
        emptyMessage="No weeks found. Create your first week to get started."
      />

      {/* Add/Edit Modal */}
      <Dialog
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingWeek(null);
          resetForm();
        }}
        title={editingWeek ? "Edit Week" : "Add Week"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Week Name */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Week Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full border border-neutral-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g., Week of Jan 15-21, 2024"
              required
            />
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

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAddModal(false);
                setEditingWeek(null);
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
              {formLoading ? 'Saving...' : (editingWeek ? 'Update' : 'Add')} Week
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Week"
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
              Delete Week
            </Button>
          </>
        }
      >
        <div className="py-4">
          <Typography className="mb-4">
            Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>?
          </Typography>
          <Typography variant="small" className="text-neutral-500">
            {deleteConfirm && formatDateRange(deleteConfirm.startDate, deleteConfirm.endDate)}
          </Typography>
          <Typography variant="small" className="text-neutral-500 mt-2">
            This action cannot be undone.
          </Typography>
        </div>
      </Dialog>
    </div>
  );
} 