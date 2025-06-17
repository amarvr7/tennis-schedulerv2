"use client";

import { UserIcon } from '@heroicons/react/24/outline';
import Typography from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import DataTable from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import Checkbox from '@/components/ui/Checkbox';
import { CoachWithGroups, TableColumn, CoachUnavailability, Week } from '@/types';

interface CoachAssignmentStepProps {
  coaches: CoachWithGroups[];
  selectedCoaches: Set<string>;
  unavailabilities: CoachUnavailability[];
  week: Week | null;
  loading: boolean;
  saving: boolean;
  onCoachToggle: (coachId: string) => void;
  onSave: () => void;
  onSelectAll: () => void;
  onUnselectAll: () => void;
}

export default function CoachAssignmentStep({
  coaches,
  selectedCoaches,
  unavailabilities,
  week,
  loading,
  saving,
  onCoachToggle,
  onSave,
  onSelectAll,
  onUnselectAll
}: CoachAssignmentStepProps) {

  const formatUnavailability = (coach: CoachWithGroups): string => {
    if (!week) return 'Available all week';
    
    const coachUnavailabilities = unavailabilities.filter(u => 
      u.coachId === coach.id &&
      u.startDate <= week.endDate &&
      u.endDate >= week.startDate
    );

    if (coachUnavailabilities.length === 0) {
      return 'Available all week';
    }

    const formatted = coachUnavailabilities.map(unavail => {
      const startDate = new Date(Math.max(unavail.startDate.getTime(), week.startDate.getTime()));
      const endDate = new Date(Math.min(unavail.endDate.getTime(), week.endDate.getTime()));
      
      if (unavail.isAllDay) {
        if (startDate.toDateString() === endDate.toDateString()) {
          return startDate.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }) + ' (all day)';
        } else {
          return `${startDate.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}-${endDate.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })} (all day)`;
        }
      } else {
        const dayStr = startDate.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
        return `${dayStr} ${unavail.startTime}-${unavail.endTime}`;
      }
    });

    return formatted.join(', ');
  };

  const columns: TableColumn<CoachWithGroups>[] = [
    {
      key: 'name',
      label: 'Coach',
      sortable: true,
      render: (value, coach) => (
        <div>
          <Typography weight="medium">{value}</Typography>
          <div className="flex items-center mt-1">
            <Badge 
              variant={coach.role === 'head' ? 'primary' : 'default'}
              size="sm"
            >
              {coach.role === 'head' ? 'Head Coach' : 'Assistant'}
            </Badge>
          </div>
        </div>
      )
    },
    {
      key: 'groups',
      label: 'Groups',
      sortable: false,
      render: (value, coach) => (
        <div className="flex flex-wrap gap-1">
          {coach.groups && coach.groups.length > 0 ? (
            coach.groups.map(group => (
              <span 
                key={group.id}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-tertiary-100 text-tertiary-700"
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

  // Add dynamic columns for unavailability and selection
  const dynamicColumns: TableColumn<CoachWithGroups>[] = [
    {
      key: 'name' as keyof CoachWithGroups, // Use existing key but override render
      label: 'Unavailability',
      sortable: false,
      render: (value, coach) => (
        <Typography variant="small" className="text-neutral-600">
          {formatUnavailability(coach)}
        </Typography>
      )
    },
    {
      key: 'name' as keyof CoachWithGroups, // Use existing key but override render
      label: 'Available',
      sortable: false,
      render: (value, coach) => (
        <Checkbox
          checked={selectedCoaches.has(coach.id)}
          onChange={() => onCoachToggle(coach.id)}
        />
      )
    }
  ];

  const allColumns = [...columns, ...dynamicColumns];

  if (coaches.length === 0) {
    return (
      <Card>
        <div className="p-6">
          <div className="flex items-center mb-6">
            <UserIcon className="h-6 w-6 text-primary-600 mr-3" />
            <div>
              <Typography variant="h2" weight="semibold">
                Step 1: Assign Coaches
              </Typography>
              <Typography variant="small" className="text-neutral-600 mt-1">
                Select which coaches will be available for this week
              </Typography>
            </div>
          </div>

          <div className="text-center py-8">
            <Typography className="text-neutral-500">
              No coaches available. Add coaches first before building schedules.
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
          <UserIcon className="h-6 w-6 text-primary-600 mr-3" />
          <div>
            <Typography variant="h2" weight="semibold">
              Step 1: Assign Coaches
            </Typography>
            <Typography variant="small" className="text-neutral-600 mt-1">
              Select which coaches will be available for this week
            </Typography>
          </div>
        </div>

        <div className="space-y-4">
          <DataTable
            data={coaches}
            columns={allColumns}
            loading={loading}
            searchPlaceholder="Search coaches..."
            emptyMessage="No coaches found."
          />

          {/* Summary & Actions */}
          <div className="border-t pt-6 mt-6">
            <div className="flex items-center justify-between">
              <div>
                <Typography weight="medium">
                  {selectedCoaches.size} coach{selectedCoaches.size !== 1 ? 'es' : ''} available for this week
                </Typography>
                <Typography variant="small" className="text-neutral-500 mt-1">
                  Uncheck coaches who are unavailable or not needed
                </Typography>
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={onUnselectAll}
                  disabled={selectedCoaches.size === 0}
                >
                  Unassign All
                </Button>
                <Button
                  variant="outline"
                  onClick={onSelectAll}
                  disabled={selectedCoaches.size === coaches.length}
                >
                  Select All
                </Button>
                <Button
                  variant="primary"
                  onClick={onSave}
                  disabled={selectedCoaches.size === 0 || saving}
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