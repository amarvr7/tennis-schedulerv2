"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, MapPinIcon, UsersIcon, TagIcon } from '@heroicons/react/24/outline';
import Typography from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import DataTable from '@/components/ui/DataTable';
import Dialog from '@/components/ui/Dialog';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Checkbox from '@/components/ui/Checkbox';
import Tabs, { Tab } from '@/components/ui/Tabs';
import { 
  Location, 
  CreateLocationData, 
  LocationWithGroups,
  LocationGroup,
  CreateLocationGroupData,
  LocationGroupWithLocations,
  TableColumn 
} from '@/types';
import { locationService } from '@/lib/services/locationService';
import { locationGroupService } from '@/lib/services/locationGroupService';

const SURFACE_TYPE_COLORS = {
  'Hard': 'default',
  'Clay': 'warning',
  'Red Clay': 'danger',
  'Indoor': 'primary',
} as const;

const SURFACE_TYPES = [
  { value: 'Hard', label: 'Hard Court' },
  { value: 'Clay', label: 'Clay Court' },
  { value: 'Red Clay', label: 'Red Clay Court' },
  { value: 'Indoor', label: 'Indoor Court' },
] as const;

const GROUP_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'
];

export default function LocationsPage() {
  // State for locations
  const [locations, setLocations] = useState<LocationWithGroups[]>([]);
  const [groups, setGroups] = useState<LocationGroupWithLocations[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<LocationWithGroups | null>(null);
  const [editingGroup, setEditingGroup] = useState<LocationGroupWithLocations | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{type: 'location' | 'group', item: any} | null>(null);

  // Form states
  const [locationForm, setLocationForm] = useState<CreateLocationData>({
    name: '',
    surfaceType: '' as any,
  });
  const [groupForm, setGroupForm] = useState<CreateLocationGroupData & {locationIds: string[]}>({
    name: '',
    description: '',
    color: GROUP_COLORS[0],
    locationIds: [],
  });

  // Load all data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [locationsData, groupsData, assignmentsData] = await Promise.all([
        locationService.getAll(),
        locationGroupService.getAll(),
        locationGroupService.getAllAssignments()
      ]);

      // Enhance locations with group information
      const locationsWithGroups: LocationWithGroups[] = locationsData.map(location => {
        const locationAssignments = assignmentsData.filter(a => a.locationId === location.id);
        const locationGroups = locationAssignments
          .map(assignment => groupsData.find(group => group.id === assignment.groupId))
          .filter(Boolean) as LocationGroup[];

        return {
          ...location,
          groups: locationGroups,
          groupCount: locationGroups.length
        };
      }).sort((a, b) => naturalSort(a.name, b.name)); // Sort locations naturally by default

      // Enhance groups with location information
      const groupsWithLocations: LocationGroupWithLocations[] = groupsData.map(group => {
        const groupAssignments = assignmentsData.filter(a => a.groupId === group.id);
        const groupLocations = groupAssignments
          .map(assignment => locationsData.find(location => location.id === assignment.locationId))
          .filter(Boolean) as Location[];

        return {
          ...group,
          locations: groupLocations,
          locationCount: groupLocations.length
        };
      });

      setLocations(locationsWithGroups);
      setGroups(groupsWithLocations);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset forms
  const resetLocationForm = () => {
    setLocationForm({
      name: '',
      surfaceType: '' as any,
    });
  };

  const resetGroupForm = () => {
    setGroupForm({
      name: '',
      description: '',
      color: GROUP_COLORS[0],
      locationIds: [],
    });
  };

  // Location handlers
  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      await locationService.create(locationForm);
      setShowLocationModal(false);
      resetLocationForm();
      await loadData();
    } catch (error) {
      console.error('Failed to add location:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLocation) return;

    try {
      setFormLoading(true);
      await locationService.update({
        id: editingLocation.id,
        ...locationForm
      });
      setEditingLocation(null);
      resetLocationForm();
      await loadData();
    } catch (error) {
      console.error('Failed to update location:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteLocation = async (location: LocationWithGroups) => {
    try {
      await Promise.all([
        locationService.delete(location.id),
        locationGroupService.deleteAssignmentsByLocation(location.id)
      ]);
      setDeleteConfirm(null);
      await loadData();
    } catch (error) {
      console.error('Failed to delete location:', error);
    }
  };

  // Group handlers
  const handleAddGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      const { locationIds, ...groupData } = groupForm;
      const groupId = await locationGroupService.create(groupData);
      
      if (locationIds.length > 0) {
        await locationGroupService.updateGroupAssignments(groupId, locationIds);
      }
      
      setShowGroupModal(false);
      resetGroupForm();
      await loadData();
    } catch (error) {
      console.error('Failed to add group:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGroup) return;

    try {
      setFormLoading(true);
      const { locationIds, ...groupData } = groupForm;
      
      await locationGroupService.update({
        id: editingGroup.id,
        ...groupData
      });
      
      await locationGroupService.updateGroupAssignments(editingGroup.id, locationIds);
      
      setEditingGroup(null);
      resetGroupForm();
      await loadData();
    } catch (error) {
      console.error('Failed to update group:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteGroup = async (group: LocationGroupWithLocations) => {
    try {
      await locationGroupService.delete(group.id);
      setDeleteConfirm(null);
      await loadData();
    } catch (error) {
      console.error('Failed to delete group:', error);
    }
  };

  // Modal handlers
  const openLocationModal = (location?: LocationWithGroups) => {
    if (location) {
      setEditingLocation(location);
      setLocationForm({
        name: location.name,
        surfaceType: location.surfaceType,
      });
    } else {
      resetLocationForm();
    }
    setShowLocationModal(true);
  };

  const openGroupModal = (group?: LocationGroupWithLocations) => {
    if (group) {
      setEditingGroup(group);
      setGroupForm({
        name: group.name,
        description: group.description || '',
        color: group.color || GROUP_COLORS[0],
        locationIds: group.locations?.map(l => l.id) || [],
      });
    } else {
      resetGroupForm();
    }
    setShowGroupModal(true);
  };

  const closeModals = () => {
    setShowLocationModal(false);
    setShowGroupModal(false);
    setEditingLocation(null);
    setEditingGroup(null);
    resetLocationForm();
    resetGroupForm();
  };

  // Natural sorting function for location names with numbers
  const naturalSort = (a: string, b: string): number => {
    const aStr = a.toString();
    const bStr = b.toString();
    
    // Use localeCompare with numeric option for natural sorting
    return aStr.localeCompare(bStr, undefined, {
      numeric: true,
      sensitivity: 'base'
    });
  };

  // Table columns for locations
  const locationColumns: TableColumn<LocationWithGroups>[] = [
    {
      key: 'name',
      label: 'Location Name',
      sortable: true,
      sortFunction: (a: LocationWithGroups, b: LocationWithGroups) => naturalSort(a.name, b.name),
      render: (value) => (
        <div className="flex items-center">
          <MapPinIcon className="h-5 w-5 text-neutral-400 mr-2" />
          <Typography weight="medium">{value}</Typography>
        </div>
      )
    },
    {
      key: 'surfaceType',
      label: 'Surface Type',
      sortable: true,
      render: (value) => (
        <Badge 
          variant={SURFACE_TYPE_COLORS[value as keyof typeof SURFACE_TYPE_COLORS] || 'default'}
          size="sm"
        >
          {value}
        </Badge>
      )
    },
    {
      key: 'groups',
      label: 'Groups',
      sortable: false,
      render: (value: LocationGroup[], location) => (
        <div className="flex flex-wrap gap-1">
          {value && value.length > 0 ? (
            value.map(group => (
              <span 
                key={group.id}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs text-white"
                style={{ backgroundColor: group.color || '#6B7280' }}
              >
                {group.name}
              </span>
            ))
          ) : (
            <Typography variant="small" className="text-neutral-400">
              No groups
            </Typography>
          )}
        </div>
      )
    }
  ];

  // Table columns for groups
  const groupColumns: TableColumn<LocationGroupWithLocations>[] = [
    {
      key: 'name',
      label: 'Group Name',
      sortable: true,
      render: (value, group) => (
        <div className="flex items-center">
          <div 
            className="w-4 h-4 rounded-full mr-2"
            style={{ backgroundColor: group.color || '#6B7280' }}
          />
          <Typography weight="medium">{value}</Typography>
        </div>
      )
    },
    {
      key: 'description',
      label: 'Description',
      sortable: false,
      render: (value) => (
        <Typography variant="small" className="text-neutral-600">
          {value || 'No description'}
        </Typography>
      )
    },
    {
      key: 'locationCount',
      label: 'Locations',
      sortable: true,
      render: (value, group) => (
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" size="sm">
            {value || 0} location{value === 1 ? '' : 's'}
          </Badge>
          {group.locations && group.locations.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {group.locations.slice(0, 3).map(location => (
                <span 
                  key={location.id}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-neutral-100 text-neutral-700"
                >
                  {location.name}
                </span>
              ))}
              {group.locations.length > 3 && (
                <span className="text-xs text-neutral-500">
                  +{group.locations.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      )
    }
  ];

  // Row actions
  const locationActions = (location: LocationWithGroups) => (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => openLocationModal(location)}
      >
        <PencilIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="error"
        size="sm"
        onClick={() => setDeleteConfirm({type: 'location', item: location})}
      >
        <TrashIcon className="h-4 w-4" />
      </Button>
    </div>
  );

  const groupActions = (group: LocationGroupWithLocations) => (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => openGroupModal(group)}
      >
        <PencilIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="error"
        size="sm"
        onClick={() => setDeleteConfirm({type: 'group', item: group})}
      >
        <TrashIcon className="h-4 w-4" />
      </Button>
    </div>
  );



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <Typography variant="h1" weight="bold" className="text-2xl sm:text-3xl md:text-4xl">
          Locations & Groups
        </Typography>
        <Typography variant="lead" className="text-neutral-600">
          Manage courts and organize them into logical groups for scheduling.
        </Typography>
      </div>

      {/* Tabs */}
      <Tabs variant="underline">
        <Tab label="Locations">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <Typography variant="p" className="text-neutral-600">
                {locations.length} location{locations.length !== 1 ? 's' : ''} total
              </Typography>
              <Button 
                variant="primary"
                onClick={() => openLocationModal()}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Location
              </Button>
            </div>

            {/* Locations Table */}
            <DataTable
              data={locations}
              columns={locationColumns}
              loading={loading}
              actions={locationActions}
              emptyMessage="No locations found. Add your first court to get started."
            />
          </div>
        </Tab>

        <Tab label="Groups">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <Typography variant="p" className="text-neutral-600">
                {groups.length} group{groups.length !== 1 ? 's' : ''} total
              </Typography>
              <Button 
                variant="primary"
                onClick={() => openGroupModal()}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Group
              </Button>
            </div>

            {/* Groups Table */}
            <DataTable
              data={groups}
              columns={groupColumns}
              loading={loading}
              actions={groupActions}
              emptyMessage="No groups found. Create groups to organize your locations."
            />
          </div>
        </Tab>
      </Tabs>

      {/* Location Modal */}
      <Dialog
        isOpen={showLocationModal}
        onClose={closeModals}
        title={editingLocation ? 'Edit Location' : 'Add New Location'}
      >
        <form onSubmit={editingLocation ? handleEditLocation : handleAddLocation} className="space-y-4">
          <Input
            label="Location Name"
            type="text"
            value={locationForm.name}
            onChange={(e) => setLocationForm({...locationForm, name: e.target.value})}
            placeholder="e.g., Court 1, Hard Court A"
            required
          />

          <Select
            label="Surface Type"
            value={locationForm.surfaceType}
            onChange={(e) => setLocationForm({...locationForm, surfaceType: e.target.value as any})}
            required
          >
            <option value="">Select surface type</option>
            {SURFACE_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </Select>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={closeModals}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              disabled={!locationForm.name.trim() || !locationForm.surfaceType || formLoading}
            >
              {formLoading ? (editingLocation ? 'Updating...' : 'Adding...') : (editingLocation ? 'Update Location' : 'Add Location')}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Group Modal */}
      <Dialog
        isOpen={showGroupModal}
        onClose={closeModals}
        title={editingGroup ? 'Edit Group' : 'Add New Group'}
      >
        <form onSubmit={editingGroup ? handleEditGroup : handleAddGroup} className="space-y-4">
          <Input
            label="Group Name"
            type="text"
            value={groupForm.name}
            onChange={(e) => setGroupForm({...groupForm, name: e.target.value})}
            placeholder="e.g., Main Courts, Practice Area"
            required
          />

          <Textarea
            label="Description"
            value={groupForm.description}
            onChange={(e) => setGroupForm({...groupForm, description: e.target.value})}
            placeholder="Optional description of this group"
            rows={2}
          />

          <div>
            <Typography variant="label" className="block mb-2">
              Color
            </Typography>
            <div className="flex gap-2">
              {GROUP_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 ${groupForm.color === color ? 'border-neutral-900' : 'border-neutral-200'}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setGroupForm({...groupForm, color})}
                />
              ))}
            </div>
          </div>

          <div>
            <Typography variant="label" className="block mb-2">
              Locations
            </Typography>
            <div className="space-y-2 max-h-48 overflow-y-auto border border-neutral-200 rounded-md p-3">
              {locations.map(location => (
                <Checkbox
                  key={location.id}
                  checked={groupForm.locationIds.includes(location.id)}
                  onChange={(checked) => {
                    if (checked) {
                      setGroupForm({
                        ...groupForm,
                        locationIds: [...groupForm.locationIds, location.id]
                      });
                    } else {
                      setGroupForm({
                        ...groupForm,
                        locationIds: groupForm.locationIds.filter(id => id !== location.id)
                      });
                    }
                  }}
                  label={
                    <div>
                      <Typography variant="small" weight="medium">
                        {location.name}
                      </Typography>
                      <Typography variant="subtle" className="text-xs">
                        {location.surfaceType}
                      </Typography>
                    </div>
                  }
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={closeModals}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              disabled={!groupForm.name.trim() || formLoading}
            >
              {formLoading ? (editingGroup ? 'Updating...' : 'Adding...') : (editingGroup ? 'Update Group' : 'Add Group')}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title={`Delete ${deleteConfirm?.type === 'location' ? 'Location' : 'Group'}`}
      >
        <div className="space-y-4">
          <Typography variant="p">
            Are you sure you want to delete <strong>{deleteConfirm?.item?.name}</strong>? This action cannot be undone.
          </Typography>

          {deleteConfirm?.type === 'location' && deleteConfirm.item.groupCount > 0 && (
            <Typography variant="small" className="text-warning-600">
              This location will be removed from {deleteConfirm.item.groupCount} group{deleteConfirm.item.groupCount === 1 ? '' : 's'}.
            </Typography>
          )}

          {deleteConfirm?.type === 'group' && deleteConfirm.item.locationCount > 0 && (
            <Typography variant="small" className="text-neutral-600">
              This will remove the group but locations will remain.
            </Typography>
          )}

          <div className="flex justify-end space-x-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setDeleteConfirm(null)}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="error"
              onClick={() => {
                if (deleteConfirm?.type === 'location') {
                  handleDeleteLocation(deleteConfirm.item);
                } else {
                  handleDeleteGroup(deleteConfirm.item);
                }
              }}
            >
              Delete {deleteConfirm?.type === 'location' ? 'Location' : 'Group'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
} 