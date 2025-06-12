"use client";

import { useState, useEffect, useCallback } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, HeartIcon } from '@heroicons/react/24/outline';
import Typography from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import DataTable from '@/components/ui/DataTable';
import Dialog from '@/components/ui/Dialog';
import PreferenceForm from '@/components/ui/PreferenceForm';
import Badge from '@/components/ui/Badge';
import { CoachPreference, CreateCoachPreferenceData, TableColumn, Coach, Week, Location, CoachPreferenceWithDetails } from '@/types';
import { coachPreferenceService } from '@/lib/services/coachPreferenceService';
import { coachService } from '@/lib/services/coachService';
import { weekService } from '@/lib/services/weekService';
import { locationService } from '@/lib/services/locationService';

export default function PreferencesPage() {
  const [preferences, setPreferences] = useState<CoachPreferenceWithDetails[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPreference, setEditingPreference] = useState<CoachPreferenceWithDetails | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<CoachPreferenceWithDetails | null>(null);

  // Load preferences and related data on component mount
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [preferencesData, coachesData, weeksData, locationsData] = await Promise.all([
        coachPreferenceService.getAll(),
        coachService.getAll(),
        weekService.getAll(),
        locationService.getAll()
      ]);

      // Enhance preferences with related data
      const preferencesWithDetails: CoachPreferenceWithDetails[] = preferencesData.map(preference => {
        const coach = coachesData.find(c => c.id === preference.coachId);
        const week = weeksData.find(w => w.id === preference.weekId);
        const locations = preference.locationIds ? 
          locationsData.filter(l => preference.locationIds!.includes(l.id)) : [];

        return {
          ...preference,
          coach,
          week,
          locations
        };
      });

      setPreferences(preferencesWithDetails);
      setCoaches(coachesData);
      setWeeks(weeksData);
      setLocations(locationsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      // TODO: Add toast notification for error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddPreference = useCallback(async (preferenceData: CreateCoachPreferenceData) => {
    try {
      setFormLoading(true);
      await coachPreferenceService.create(preferenceData);
      
      setShowAddModal(false);
      await loadData(); // Reload the list
      // TODO: Add success toast
    } catch (error) {
      console.error('Failed to add preference:', error);
      // TODO: Add error toast
      if (error instanceof Error && error.message.includes('already has a preference')) {
        // Handle duplicate preference error specifically
        alert('This coach already has a preference for the selected week. Please edit the existing preference or choose a different week.');
      }
    } finally {
      setFormLoading(false);
    }
  }, [loadData]);

  const handleEditPreference = useCallback(async (preferenceData: CreateCoachPreferenceData) => {
    if (!editingPreference) return;

    try {
      setFormLoading(true);
      
      await coachPreferenceService.update({
        id: editingPreference.id,
        ...preferenceData
      });
      
      setEditingPreference(null);
      await loadData(); // Reload the list
      // TODO: Add success toast
    } catch (error) {
      console.error('Failed to update preference:', error);
      // TODO: Add error toast
    } finally {
      setFormLoading(false);
    }
  }, [editingPreference, loadData]);

  const handleDeletePreference = useCallback(async (preference: CoachPreferenceWithDetails) => {
    try {
      await coachPreferenceService.delete(preference.id);
      
      setDeleteConfirm(null);
      await loadData(); // Reload the list
      // TODO: Add success toast
    } catch (error) {
      console.error('Failed to delete preference:', error);
      // TODO: Add error toast
    }
  }, [loadData]);

  // Define table columns
  const columns: TableColumn<CoachPreferenceWithDetails>[] = [
    {
      key: 'coach',
      label: 'Coach',
      sortable: true,
      render: (value, preference) => (
        <div>
          <Typography weight="medium">{preference.coach?.name || 'Unknown Coach'}</Typography>
          <Typography variant="small" className="text-neutral-500">
            {preference.coach?.role === 'head' ? 'Head Coach' : 'Assistant Coach'}
          </Typography>
        </div>
      )
    },
    {
      key: 'week',
      label: 'Week',
      sortable: true,
      render: (value, preference) => (
        <div>
          <Typography weight="medium">{preference.week?.name || 'Unknown Week'}</Typography>
          <Typography variant="small" className="text-neutral-500">
            {preference.week && (
              `${new Date(preference.week.startDate).toLocaleDateString()} - ${new Date(preference.week.endDate).toLocaleDateString()}`
            )}
          </Typography>
        </div>
      )
    },
    {
      key: 'preferenceType',
      label: 'Preference',
      sortable: true,
      render: (value, preference) => (
        <div className="flex items-center space-x-2">
          <Badge 
            variant={preference.preferenceType === 'location' ? 'primary' : 'secondary'}
            size="sm"
          >
            {preference.preferenceType === 'location' ? 'Location' : 'Surface'}
          </Badge>
          <div>
                    {preference.preferenceType === 'location' ? (
          <div>
            <Typography variant="small" weight="medium">
              {preference.locations && preference.locations.length > 0 
                ? preference.locations.map(loc => loc.name).join(', ')
                : 'Unknown Location'
              }
            </Typography>
            <Typography variant="small" className="text-neutral-500">
              {preference.locations && preference.locations.length > 0 
                ? [...new Set(preference.locations.map(loc => loc.surfaceType))].join(', ')
                : ''
              }
            </Typography>
          </div>
        ) : (
              <Typography variant="small" weight="medium">
                {preference.surfaceType} Court
              </Typography>
            )}
          </div>
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
  const rowActions = (preference: CoachPreferenceWithDetails) => (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setEditingPreference(preference)}
      >
        <PencilIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="error"
        size="sm"
        onClick={() => setDeleteConfirm(preference)}
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
            Coach Preferences
          </Typography>
          <Typography variant="lead" className="text-neutral-600">
            Manage coach preferences for specific weeks and locations/surfaces
          </Typography>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowAddModal(true)}
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Preference
        </Button>
      </div>

      {/* Preferences Table */}
      <DataTable
        data={preferences}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search preferences..."
        actions={rowActions}
        emptyMessage="No preferences found. Add coach preferences to get started."
      />

      {/* Add Preference Modal */}
      <Dialog
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Preference"
        size="lg"
      >
        <PreferenceForm
          onSubmit={handleAddPreference}
          onCancel={() => setShowAddModal(false)}
          loading={formLoading}
          coaches={coaches}
          weeks={weeks}
          locations={locations}
        />
      </Dialog>

      {/* Edit Preference Modal */}
      <Dialog
        isOpen={!!editingPreference}
        onClose={() => setEditingPreference(null)}
        title="Edit Preference"
        size="lg"
      >
        {editingPreference && (
          <PreferenceForm
            initialData={editingPreference}
            onSubmit={handleEditPreference}
            onCancel={() => setEditingPreference(null)}
            loading={formLoading}
            isEdit
            coaches={coaches}
            weeks={weeks}
            locations={locations}
          />
        )}
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Preference"
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
              onClick={() => deleteConfirm && handleDeletePreference(deleteConfirm)}
            >
              Delete Preference
            </Button>
          </>
        }
      >
        <div className="py-4">
          <Typography className="mb-4">
            Are you sure you want to delete this preference for <strong>{deleteConfirm?.coach?.name}</strong>? 
          </Typography>
          <Typography variant="small" className="text-neutral-500">
            This action cannot be undone.
          </Typography>
        </div>
      </Dialog>
    </div>
  );
} 