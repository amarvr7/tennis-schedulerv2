"use client";

import { MapPinIcon } from '@heroicons/react/24/outline';
import Typography from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import DataTable from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import Checkbox from '@/components/ui/Checkbox';
import { Location, TableColumn } from '@/types';

interface LocationAssignmentStepProps {
  locations: Location[];
  selectedLocations: Set<string>;
  loading: boolean;
  saving: boolean;
  onLocationToggle: (locationId: string) => void;
  onSave: () => void;
  onPrevious: () => void;
  onSelectAll: () => void;
  onUnselectAll: () => void;
}

export default function LocationAssignmentStep({
  locations,
  selectedLocations,
  loading,
  saving,
  onLocationToggle,
  onSave,
  onPrevious,
  onSelectAll,
  onUnselectAll
}: LocationAssignmentStepProps) {

  const columns: TableColumn<Location>[] = [
    {
      key: 'name',
      label: 'Location',
      sortable: true,
      render: (value, location) => (
        <div>
          <Typography weight="medium">{value}</Typography>
          {/* Note: address property may not exist on Location type */}
          <Typography variant="small" className="text-neutral-500 mt-1">
            Location details
          </Typography>
        </div>
      )
    },
    {
      key: 'surfaceType',
      label: 'Surface',
      sortable: true,
      render: (value) => (
        <Badge variant="default" size="sm">
          {value}
        </Badge>
      )
    }
  ];

  // Add dynamic column for selection
  const dynamicColumns: TableColumn<Location>[] = [
    {
      key: 'name' as keyof Location, // Use existing key but override render
      label: 'Available',
      sortable: false,
      render: (value, location) => (
        <Checkbox
          checked={selectedLocations.has(location.id)}
          onChange={() => onLocationToggle(location.id)}
        />
      )
    }
  ];

  const allColumns = [...columns, ...dynamicColumns];

  if (locations.length === 0) {
    return (
      <Card>
        <div className="p-6">
          <div className="flex items-center mb-6">
            <MapPinIcon className="h-6 w-6 text-primary-600 mr-3" />
            <div>
              <Typography variant="h2" weight="semibold">
                Step 3: Assign Locations
              </Typography>
              <Typography variant="small" className="text-neutral-600 mt-1">
                Select which locations will be available for this week
              </Typography>
            </div>
          </div>

          <div className="text-center py-8">
            <Typography className="text-neutral-500">
              No locations available. Add locations first before building schedules.
            </Typography>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center mb-6">
          <MapPinIcon className="h-6 w-6 text-primary-600 mr-3" />
          <div>
            <Typography variant="h2" weight="semibold">
              Step 3: Assign Locations
            </Typography>
            <Typography variant="small" className="text-neutral-600 mt-1">
              Select which locations will be available for this week
            </Typography>
          </div>
        </div>

        <div className="space-y-4">
          <DataTable
            data={locations}
            columns={allColumns}
            loading={loading}
            searchPlaceholder="Search locations..."
            emptyMessage="No locations found."
          />

          {/* Summary & Actions */}
          <div className="border-t pt-6 mt-6">
            <div className="flex items-center justify-between">
              <div>
                <Typography weight="medium">
                  {selectedLocations.size} location{selectedLocations.size !== 1 ? 's' : ''} available for this week
                </Typography>
                <Typography variant="small" className="text-neutral-500 mt-1">
                  Uncheck locations that are unavailable or undergoing maintenance
                </Typography>
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={onUnselectAll}
                  disabled={selectedLocations.size === 0}
                >
                  Unassign All
                </Button>
                <Button
                  variant="outline"
                  onClick={onSelectAll}
                  disabled={selectedLocations.size === locations.length}
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  onClick={onPrevious}
                >
                  Back to Groups
                </Button>
                <Button
                  variant="primary"
                  onClick={onSave}
                  disabled={selectedLocations.size === 0 || saving}
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