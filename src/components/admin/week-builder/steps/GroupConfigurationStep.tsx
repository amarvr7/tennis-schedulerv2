"use client";

import { UserGroupIcon } from '@heroicons/react/24/outline';
import Typography from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import DataTable from '@/components/ui/DataTable';
import { GroupWithWeekData, TableColumn, GroupPreference, Location } from '@/types';
import { useRouter } from 'next/navigation';

interface GroupConfigurationStepProps {
  groups: GroupWithWeekData[];
  groupPreferences: GroupPreference[];
  locations: Location[];
  loading: boolean;
  saving: boolean;
  weekId: string;
  onGroupSizeChange: (groupId: string, newSize: number) => void;
  onSave: () => void;
  onPrevious: () => void;
}

export default function GroupConfigurationStep({
  groups,
  groupPreferences,
  locations,
  loading,
  saving,
  weekId,
  onGroupSizeChange,
  onSave,
  onPrevious
}: GroupConfigurationStepProps) {
  const router = useRouter();

  // Helper function to get group preferences for this week
  const getGroupPreferences = (groupId: string) => {
    return groupPreferences.find(pref => pref.groupId === groupId);
  };

  // Helper function to get location name by ID
  const getLocationName = (locationId: string) => {
    const location = locations.find(loc => loc.id === locationId);
    return location?.name || 'Unknown location';
  };

  const columns: TableColumn<GroupWithWeekData>[] = [
    {
      key: 'name',
      label: 'Group',
      sortable: true,
      render: (value, group) => (
        <div>
          <Typography weight="medium">{value}</Typography>
          <Typography variant="small" className="text-neutral-500 mt-1">
            Default size: {group.size} players
          </Typography>
        </div>
      )
    },
    {
      key: 'weekSize',
      label: 'Week Size',
      sortable: false,
      render: (value, group) => (
        <div className="flex items-center space-x-2">
          <input
            type="number"
            min="1"
            max="20"
            value={group.weekSize || group.size}
            onChange={(e) => onGroupSizeChange(group.id, parseInt(e.target.value) || group.size)}
            className="w-16 px-2 py-1 border border-neutral-300 rounded text-sm focus:ring-primary-500 focus:border-primary-500"
          />
          <Typography variant="small" className="text-neutral-500">players</Typography>
        </div>
      )
    },
    {
      key: 'preferences',
      label: 'Preferences',
      sortable: false,
      render: (value, group) => {
        const preferences = getGroupPreferences(group.id);
        return (
          <div className="space-y-1">
            <div>
              <Typography variant="small" className="text-neutral-500">Location:</Typography>
              <Typography variant="small" className="text-neutral-600">
                {preferences?.preferenceType === 'location' && preferences?.locationIds && preferences.locationIds.length > 0
                  ? preferences.locationIds.map(id => getLocationName(id)).join(', ')
                  : 'Any location'}
              </Typography>
            </div>
            <div>
              <Typography variant="small" className="text-neutral-500">Surface:</Typography>
              <Typography variant="small" className="text-neutral-600">
                {preferences?.preferenceType === 'surface' && preferences?.surfaceType
                  ? preferences.surfaceType
                  : 'Any surface'}
              </Typography>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-1"
              onClick={() => router.push(`/admin/preferences?groupId=${group.id}&weekId=${weekId}`)}
            >
              Edit Preferences
            </Button>
          </div>
        );
      }
    }
  ];

  if (groups.length === 0) {
    return (
      <Card>
        <div className="p-6">
          <div className="flex items-center mb-6">
            <UserGroupIcon className="h-6 w-6 text-primary-600 mr-3" />
            <div>
              <Typography variant="h2" weight="semibold">
                Step 2: Group Size & Preferences
              </Typography>
              <Typography variant="small" className="text-neutral-600 mt-1">
                Adjust group sizes for this week and set location/surface preferences
              </Typography>
            </div>
          </div>

          <div className="text-center py-8">
            <Typography className="text-neutral-500">
              No groups available. Add groups first before building schedules.
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
          <UserGroupIcon className="h-6 w-6 text-primary-600 mr-3" />
          <div>
            <Typography variant="h2" weight="semibold">
              Step 2: Group Size & Preferences
            </Typography>
            <Typography variant="small" className="text-neutral-600 mt-1">
              Adjust group sizes for this week and set location/surface preferences
            </Typography>
          </div>
        </div>

        <div className="space-y-4">
          <DataTable
            data={groups}
            columns={columns}
            loading={loading}
            searchPlaceholder="Search groups..."
            emptyMessage="No groups found."
          />

          {/* Summary & Actions */}
          <div className="border-t pt-6 mt-6">
            <div className="flex items-center justify-between">
              <div>
                <Typography weight="medium">
                  {groups.length} group{groups.length !== 1 ? 's' : ''} configured
                </Typography>
                <Typography variant="small" className="text-neutral-500 mt-1">
                  Adjust sizes and preferences as needed for this week
                </Typography>
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={onPrevious}
                >
                  Back to Coaches
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