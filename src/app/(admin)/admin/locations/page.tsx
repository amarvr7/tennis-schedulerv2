"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, MapPinIcon } from '@heroicons/react/24/outline';
import Typography from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import DataTable from '@/components/ui/DataTable';
import Dialog from '@/components/ui/Dialog';
import LocationForm from '@/components/ui/LocationForm';
import Badge from '@/components/ui/Badge';
import { Location, CreateLocationData, TableColumn, LocationWithAdjacent } from '@/types';
import { locationService } from '@/lib/services/locationService';
import { adjacencyService } from '@/lib/services/adjacencyService';

const SURFACE_TYPE_COLORS = {
  'Hard': 'default',
  'Clay': 'warning',
  'Red Clay': 'danger',
  'Indoor': 'primary',
} as const;

export default function LocationsPage() {
  const [locations, setLocations] = useState<LocationWithAdjacent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<LocationWithAdjacent | null>(null);
  const [editingAdjacentIds, setEditingAdjacentIds] = useState<string[]>([]);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<LocationWithAdjacent | null>(null);

  // Memoize loadData to prevent infinite re-renders
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [locationsData, adjacenciesData] = await Promise.all([
        locationService.getAll(),
        adjacencyService.getAll()
      ]);

      // Enhance locations with adjacency information
      const locationsWithAdjacent: LocationWithAdjacent[] = locationsData.map(location => {
        const locationAdjacencies = adjacenciesData.filter(
          adj => adj.locationId1 === location.id || adj.locationId2 === location.id
        );
        
        const adjacentLocations = locationAdjacencies
          .map(adjacency => {
            const adjacentId = adjacency.locationId1 === location.id 
              ? adjacency.locationId2 
              : adjacency.locationId1;
            return locationsData.find(loc => loc.id === adjacentId);
          })
          .filter(Boolean) as Location[];

        return {
          ...location,
          adjacentLocations,
          adjacentCount: adjacentLocations.length
        };
      });

      setLocations(locationsWithAdjacent);
    } catch (error) {
      console.error('Failed to load data:', error);
      // TODO: Add toast notification for error
    } finally {
      setLoading(false);
    }
  }, []);

  // Load locations on component mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddLocation = useCallback(async (locationData: CreateLocationData) => {
    try {
      setFormLoading(true);
      const locationId = await locationService.create(locationData);
      
      // Set up adjacencies if any were selected
      if (locationData.adjacentLocationIds && locationData.adjacentLocationIds.length > 0) {
        await adjacencyService.updateLocationAdjacencies(locationId, locationData.adjacentLocationIds);
      }
      
      setShowAddModal(false);
      await loadData(); // Reload the list
      // TODO: Add success toast
    } catch (error) {
      console.error('Failed to add location:', error);
      // TODO: Add error toast
    } finally {
      setFormLoading(false);
    }
  }, [loadData]);

  const handleEditLocation = useCallback(async (locationData: CreateLocationData) => {
    if (!editingLocation) return;

    try {
      setFormLoading(true);
      
      // Update location basic info
      await locationService.update({
        id: editingLocation.id,
        name: locationData.name,
        surfaceType: locationData.surfaceType
      });
      
      // Update adjacencies
      if (locationData.adjacentLocationIds) {
        await adjacencyService.updateLocationAdjacencies(editingLocation.id, locationData.adjacentLocationIds);
      }
      
      setEditingLocation(null);
      setEditingAdjacentIds([]);
      await loadData(); // Reload the list
      // TODO: Add success toast
    } catch (error) {
      console.error('Failed to update location:', error);
      // TODO: Add error toast
    } finally {
      setFormLoading(false);
    }
  }, [editingLocation, loadData]);

  const handleDeleteLocation = useCallback(async (location: LocationWithAdjacent) => {
    try {
      // Delete location and all its adjacencies
      await Promise.all([
        locationService.delete(location.id),
        adjacencyService.deleteByLocation(location.id)
      ]);
      
      setDeleteConfirm(null);
      await loadData(); // Reload the list
      // TODO: Add success toast
    } catch (error) {
      console.error('Failed to delete location:', error);
      // TODO: Add error toast
    }
  }, [loadData]);

  const handleEditClick = useCallback(async (location: LocationWithAdjacent) => {
    try {
      // Get current adjacencies for this location
      const adjacencies = await adjacencyService.getByLocation(location.id);
      const adjacentIds = adjacencies.map(adj => 
        adj.locationId1 === location.id ? adj.locationId2 : adj.locationId1
      );
      
      setEditingAdjacentIds(adjacentIds);
      setEditingLocation(location);
    } catch (error) {
      console.error('Failed to load location adjacencies:', error);
      // TODO: Add error toast
    }
  }, []);

  // Memoize table columns to prevent recreation
  const columns = useMemo((): TableColumn<LocationWithAdjacent>[] => [
    {
      key: 'name',
      label: 'Location Name',
      sortable: true,
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
      key: 'adjacentCount',
      label: 'Adjacent Locations',
      sortable: true,
      render: (value, location) => (
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" size="sm">
            {value || 0} adjacent
          </Badge>
          {location.adjacentLocations && location.adjacentLocations.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {location.adjacentLocations.slice(0, 2).map(adjacent => (
                <span 
                  key={adjacent.id}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-neutral-100 text-neutral-700"
                >
                  {adjacent.name}
                </span>
              ))}
              {location.adjacentLocations.length > 2 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-neutral-100 text-neutral-700">
                  +{location.adjacentLocations.length - 2} more
                </span>
              )}
            </div>
          )}
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
  ], []);

  // Memoize row actions to prevent recreation
  const rowActions = useCallback((location: LocationWithAdjacent) => (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleEditClick(location)}
      >
        <PencilIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="error"
        size="sm"
        onClick={() => setDeleteConfirm(location)}
      >
        <TrashIcon className="h-4 w-4" />
      </Button>
    </div>
  ), [handleEditClick]);

  // Memoize stable adjacent IDs array
  const stableEditingAdjacentIds = useMemo(() => [...editingAdjacentIds], [editingAdjacentIds.join(',')]);

  // Get base locations array for form
  const baseLocations = useMemo(() => 
    locations.map(loc => ({
      id: loc.id,
      name: loc.name,
      surfaceType: loc.surfaceType,
      createdAt: loc.createdAt,
      updatedAt: loc.updatedAt
    })),
    [locations]
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <Typography variant="h1" weight="bold" className="mb-2">
            Locations
          </Typography>
          <Typography variant="lead" className="text-neutral-600">
            Manage court and field locations with adjacency relationships
          </Typography>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowAddModal(true)}
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Location
        </Button>
      </div>

      {/* Locations Table */}
      <DataTable
        data={locations}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search locations..."
        actions={rowActions}
        emptyMessage="No locations found. Create your first location to get started."
      />

      {/* Add Location Modal */}
      <Dialog
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Create New Location"
        size="lg"
      >
        <LocationForm
          onSubmit={handleAddLocation}
          onCancel={() => setShowAddModal(false)}
          loading={formLoading}
          locations={baseLocations}
        />
      </Dialog>

      {/* Edit Location Modal */}
      <Dialog
        isOpen={!!editingLocation}
        onClose={() => {
          setEditingLocation(null);
          setEditingAdjacentIds([]);
        }}
        title="Edit Location"
        size="lg"
      >
        {editingLocation && (
          <LocationForm
            initialData={editingLocation}
            initialAdjacentIds={stableEditingAdjacentIds}
            currentLocationId={editingLocation.id}
            onSubmit={handleEditLocation}
            onCancel={() => {
              setEditingLocation(null);
              setEditingAdjacentIds([]);
            }}
            loading={formLoading}
            locations={baseLocations}
            isEdit
          />
        )}
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Location"
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
              onClick={() => deleteConfirm && handleDeleteLocation(deleteConfirm)}
            >
              Delete Location
            </Button>
          </>
        }
      >
        <div className="py-4">
          <Typography className="mb-4">
            Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>?
          </Typography>
          {deleteConfirm?.adjacentCount && deleteConfirm.adjacentCount > 0 && (
            <Typography variant="small" className="text-warning-600">
              This will also remove all adjacency relationships for this location.
            </Typography>
          )}
          <Typography variant="small" className="text-neutral-500 mt-2">
            This action cannot be undone.
          </Typography>
        </div>
      </Dialog>
    </div>
  );
} 