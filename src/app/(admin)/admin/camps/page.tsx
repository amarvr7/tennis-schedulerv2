"use client";

import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import Typography from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import DataTable from '@/components/ui/DataTable';
import Dialog from '@/components/ui/Dialog';
import Badge from '@/components/ui/Badge';
import { Week, Camp, CreateCampData, TableColumn, CampWithWeek } from '@/types';
import { campService } from '@/lib/services/campService';
import { weekService } from '@/lib/services/weekService';

export default function CampsPage() {
  const [camps, setCamps] = useState<CampWithWeek[]>([]);
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCamp, setEditingCamp] = useState<CampWithWeek | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<CampWithWeek | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    weekId: '',
    juniorPlayers: 0,
    adultPlayers: {} as { [day: string]: number }
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [campsData, weeksData] = await Promise.all([
        campService.getAll(),
        weekService.getAll()
      ]);

      // Enhance camps with week information
      const campsWithWeeks: CampWithWeek[] = campsData.map(camp => {
        const week = weeksData.find(w => w.id === camp.weekId);
        return {
          ...camp,
          week
        };
      });

      setCamps(campsWithWeeks);
      setWeeks(weeksData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      weekId: '',
      juniorPlayers: 0,
      adultPlayers: {}
    });
  };

  const populateForm = (camp: CampWithWeek) => {
    setFormData({
      weekId: camp.weekId,
      juniorPlayers: camp.juniorPlayers,
      adultPlayers: { ...camp.adultPlayers }
    });
  };

  // Get days for selected week with unique date keys
  const getWeekDays = (weekId: string): Array<{date: string, dayName: string, displayDate: string}> => {
    const week = weeks.find(w => w.id === weekId);
    if (!week) return [];

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

  // Get available weeks (not already assigned to camps, unless editing)
  const getAvailableWeeks = (): Week[] => {
    if (editingCamp) {
      // When editing, include the current week
      return weeks;
    }
    
    // Filter out weeks that already have camps
    const assignedWeekIds = camps.map(camp => camp.weekId);
    return weeks.filter(week => !assignedWeekIds.includes(week.id));
  };

  const validateForm = () => {
    if (!formData.weekId) {
      alert('Please select a week');
      return false;
    }

    if (formData.juniorPlayers < 0) {
      alert('Junior players cannot be negative');
      return false;
    }

    // Check adult players for negative values
    for (const [day, count] of Object.entries(formData.adultPlayers)) {
      if (count < 0) {
        alert(`Adult players for ${day} cannot be negative`);
        return false;
      }
    }

    return true;
  };

  const handleWeekChange = (weekId: string) => {
    setFormData(prev => {
      const newAdultPlayers: { [day: string]: number } = {};
      
      // Initialize adult players for each day of the new week
      const weekDays = getWeekDays(weekId);
      weekDays.forEach(dayInfo => {
        newAdultPlayers[dayInfo.date] = prev.adultPlayers[dayInfo.date] || 0;
      });

      return {
        ...prev,
        weekId,
        adultPlayers: newAdultPlayers
      };
    });
  };

  const handleAdultPlayerChange = (date: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      adultPlayers: {
        ...prev.adultPlayers,
        [date]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setFormLoading(true);
      
      const campData: CreateCampData = {
        weekId: formData.weekId,
        juniorPlayers: formData.juniorPlayers,
        adultPlayers: formData.adultPlayers
      };

      if (editingCamp) {
        await campService.update({
          id: editingCamp.id,
          ...campData
        });
      } else {
        await campService.create(campData);
      }

      setShowAddModal(false);
      setEditingCamp(null);
      resetForm();
      await loadData();
    } catch (error) {
      console.error('Failed to save camp:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (camp: CampWithWeek) => {
    try {
      await campService.delete(camp.id);
      setDeleteConfirm(null);
      await loadData();
    } catch (error) {
      console.error('Failed to delete camp:', error);
    }
  };

  const handleEdit = (camp: CampWithWeek) => {
    setEditingCamp(camp);
    populateForm(camp);
    setShowAddModal(true);
  };

  const handleAdd = () => {
    setEditingCamp(null);
    resetForm();
    setShowAddModal(true);
  };

  const formatDateRange = (startDate: Date, endDate: Date) => {
    const start = startDate.toLocaleDateString();
    const end = endDate.toLocaleDateString();
    return `${start} - ${end}`;
  };

  const getTotalAdultPlayers = (adultPlayers: { [day: string]: number }) => {
    return Object.values(adultPlayers).reduce((sum, count) => sum + count, 0);
  };

  const formatAdultPlayers = (adultPlayers: { [day: string]: number }) => {
    const entries = Object.entries(adultPlayers);
    if (entries.length === 0) return 'No daily data';
    
    const total = getTotalAdultPlayers(adultPlayers);
    const daysWithPlayers = entries.filter(([_, count]) => count > 0).length;
    
    return `${total} total (${daysWithPlayers} days)`;
  };

  // Define table columns
  const columns: TableColumn<CampWithWeek>[] = [
    {
      key: 'week',
      label: 'Week',
      sortable: true,
      render: (value, camp) => (
        <div className="flex items-center">
          <UserGroupIcon className="h-5 w-5 text-neutral-400 mr-2" />
          <div>
            <Typography weight="medium">{camp.week?.name || 'Unknown Week'}</Typography>
            <Typography variant="small" className="text-neutral-500">
              {camp.week && formatDateRange(camp.week.startDate, camp.week.endDate)}
            </Typography>
          </div>
        </div>
      )
    },
    {
      key: 'juniorPlayers',
      label: 'Juniors',
      sortable: true,
      render: (value) => (
        <div>
          <Badge variant="primary" size="sm">
            {value} juniors
          </Badge>
          <Typography variant="small" className="text-neutral-500 mt-1">
            Whole week
          </Typography>
        </div>
      )
    },
    {
      key: 'adultPlayers',
      label: 'Adults',
      sortable: false,
      render: (value) => (
        <div>
          <Badge variant="secondary" size="sm">
            {formatAdultPlayers(value)}
          </Badge>
          <Typography variant="small" className="text-neutral-500 mt-1">
            Daily attendance
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
  const rowActions = (camp: CampWithWeek) => (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleEdit(camp)}
      >
        <PencilIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="error"
        size="sm"
        onClick={() => setDeleteConfirm(camp)}
      >
        <TrashIcon className="h-4 w-4" />
      </Button>
    </div>
  );

  const availableWeeks = getAvailableWeeks();
  const selectedWeekDays = getWeekDays(formData.weekId);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <Typography variant="h1" weight="bold" className="mb-2">
            Camps
          </Typography>
          <Typography variant="lead" className="text-neutral-600">
            Manage camps with junior and daily adult player counts
          </Typography>
        </div>
        <Button
          variant="primary"
          onClick={handleAdd}
          disabled={availableWeeks.length === 0 && !editingCamp}
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Camp
        </Button>
      </div>

      {/* Camps Table */}
      <DataTable
        data={camps}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search camps..."
        actions={rowActions}
        emptyMessage="No camps found. Create your first camp to get started."
      />

      {/* Add/Edit Modal */}
      <Dialog
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingCamp(null);
          resetForm();
        }}
        title={editingCamp ? "Edit Camp" : "Add Camp"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Week Selection */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Week *
            </label>
            <select
              value={formData.weekId}
              onChange={(e) => handleWeekChange(e.target.value)}
              className="w-full border border-neutral-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
              required
              disabled={editingCamp ? true : false} // Don't allow changing week when editing
            >
              <option value="">Select a week</option>
              {availableWeeks.map(week => (
                <option key={week.id} value={week.id}>
                  {week.name} ({formatDateRange(week.startDate, week.endDate)})
                </option>
              ))}
            </select>
            {!editingCamp && availableWeeks.length === 0 && (
              <Typography variant="small" className="text-neutral-500 mt-1">
                All weeks already have camps assigned. Create more weeks first.
              </Typography>
            )}
          </div>

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
              placeholder="0"
              required
            />
          </div>

                     {/* Adult Players by Day */}
           {selectedWeekDays.length > 0 && (
             <div>
               <label className="block text-sm font-medium text-neutral-700 mb-3">
                 Adult Players (Daily Count)
               </label>
               <div className="max-h-60 overflow-y-auto space-y-2">
                 {selectedWeekDays.map(dayInfo => (
                   <div key={dayInfo.date} className="flex items-center space-x-3 p-2 bg-neutral-50 rounded-md">
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
                       placeholder="0"
                     />
                     <Typography variant="small" className="text-neutral-500">
                       adults
                     </Typography>
                   </div>
                 ))}
               </div>
             </div>
           )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAddModal(false);
                setEditingCamp(null);
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
              {formLoading ? 'Saving...' : (editingCamp ? 'Update' : 'Add')} Camp
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Camp"
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
              Delete Camp
            </Button>
          </>
        }
      >
        <div className="py-4">
          <Typography className="mb-4">
            Are you sure you want to delete the camp for <strong>{deleteConfirm?.week?.name}</strong>?
          </Typography>
          <Typography variant="small" className="text-neutral-500">
            {deleteConfirm?.week && formatDateRange(deleteConfirm.week.startDate, deleteConfirm.week.endDate)}
          </Typography>
          <Typography variant="small" className="text-neutral-500 mt-1">
            {deleteConfirm && `${deleteConfirm.juniorPlayers} juniors, ${getTotalAdultPlayers(deleteConfirm.adultPlayers)} adults total`}
          </Typography>
          <Typography variant="small" className="text-neutral-500 mt-2">
            This action cannot be undone.
          </Typography>
        </div>
      </Dialog>
    </div>
  );
} 