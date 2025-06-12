"use client";

import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import Typography from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import DataTable from '@/components/ui/DataTable';
import Dialog from '@/components/ui/Dialog';
import CoachForm from '@/components/ui/CoachForm';
import Badge from '@/components/ui/Badge';
import { Coach, CreateCoachData, TableColumn, CoachWithGroups, Group } from '@/types';
import { coachService } from '@/lib/services/coachService';
import { groupService } from '@/lib/services/groupService';
import { assignmentService } from '@/lib/services/assignmentService';

export default function CoachesPage() {
  const [coaches, setCoaches] = useState<CoachWithGroups[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCoach, setEditingCoach] = useState<Coach | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Coach | null>(null);

  // Load coaches and their group assignments on component mount
  useEffect(() => {
    loadCoaches();
  }, []);

  const loadCoaches = async () => {
    try {
      setLoading(true);
      const [coachesData, groupsData, assignmentsData] = await Promise.all([
        coachService.getAll(),
        groupService.getAll(),
        assignmentService.getAll()
      ]);

      // Enhance coaches with group information
      const coachesWithGroups: CoachWithGroups[] = coachesData.map(coach => {
        const coachAssignments = assignmentsData.filter(a => a.coachId === coach.id);
        const coachGroups = coachAssignments
          .map(assignment => groupsData.find(group => group.id === assignment.groupId))
          .filter(Boolean) as Group[];

        return {
          ...coach,
          groups: coachGroups
        };
      });

      setCoaches(coachesWithGroups);
    } catch (error) {
      console.error('Failed to load coaches:', error);
      // TODO: Add toast notification for error
    } finally {
      setLoading(false);
    }
  };

  const handleAddCoach = async (coachData: CreateCoachData) => {
    try {
      setFormLoading(true);
      await coachService.create(coachData);
      setShowAddModal(false);
      await loadCoaches(); // Reload the list
      // TODO: Add success toast
    } catch (error) {
      console.error('Failed to add coach:', error);
      // TODO: Add error toast
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditCoach = async (coachData: CreateCoachData) => {
    if (!editingCoach) return;

    try {
      setFormLoading(true);
      await coachService.update({
        id: editingCoach.id,
        ...coachData
      });
      setEditingCoach(null);
      await loadCoaches(); // Reload the list
      // TODO: Add success toast
    } catch (error) {
      console.error('Failed to update coach:', error);
      // TODO: Add error toast
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCoach = async (coach: Coach) => {
    try {
      // Delete coach and all their assignments
      await Promise.all([
        coachService.delete(coach.id),
        assignmentService.deleteByCoach(coach.id)
      ]);
      
      setDeleteConfirm(null);
      await loadCoaches(); // Reload the list
      // TODO: Add success toast
    } catch (error) {
      console.error('Failed to delete coach:', error);
      // TODO: Add error toast
    }
  };

  // Define table columns
  const columns: TableColumn<CoachWithGroups>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (value, coach) => (
        <div>
          <Typography weight="medium">{value}</Typography>
          <Typography variant="small" className="text-neutral-500">
            {coach.email}
          </Typography>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (value) => (
        <Badge 
          variant={value === 'head' ? 'primary' : 'secondary'}
          size="sm"
        >
          {value === 'head' ? 'Head Coach' : 'Assistant Coach'}
        </Badge>
      )
    },
    {
      key: 'groups',
      label: 'Groups',
      sortable: false,
      render: (value: Group[], coach) => (
        <div className="flex flex-wrap gap-1">
          {value && value.length > 0 ? (
            value.map(group => (
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
    },
    {
      key: 'phone',
      label: 'Phone',
      sortable: true,
      render: (value) => (
        <Typography variant="small">{value}</Typography>
      )
    },
    {
      key: 'createdAt',
      label: 'Added',
      sortable: true,
      render: (value) => (
        <Typography variant="small" className="text-neutral-500">
          {new Date(value).toLocaleDateString()}
        </Typography>
      )
    }
  ];

  // Define row actions
  const rowActions = (coach: CoachWithGroups) => (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setEditingCoach(coach)}
      >
        <PencilIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="error"
        size="sm"
        onClick={() => setDeleteConfirm(coach)}
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
            Coaches
          </Typography>
          <Typography variant="lead" className="text-neutral-600">
            Manage your coaching staff
          </Typography>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowAddModal(true)}
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Coach
        </Button>
      </div>

      {/* Coaches Table */}
      <DataTable
        data={coaches}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search coaches..."
        actions={rowActions}
        emptyMessage="No coaches found. Add your first coach to get started."
      />

      {/* Add Coach Modal */}
      <Dialog
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Coach"
        size="lg"
      >
        <CoachForm
          onSubmit={handleAddCoach}
          onCancel={() => setShowAddModal(false)}
          loading={formLoading}
        />
      </Dialog>

      {/* Edit Coach Modal */}
      <Dialog
        isOpen={!!editingCoach}
        onClose={() => setEditingCoach(null)}
        title="Edit Coach"
        size="lg"
      >
        {editingCoach && (
          <CoachForm
            initialData={editingCoach}
            onSubmit={handleEditCoach}
            onCancel={() => setEditingCoach(null)}
            loading={formLoading}
            isEdit
          />
        )}
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Coach"
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
              onClick={() => deleteConfirm && handleDeleteCoach(deleteConfirm)}
            >
              Delete Coach
            </Button>
          </>
        }
      >
        <div className="py-4">
          <Typography className="mb-4">
            Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>? 
          </Typography>
          <Typography variant="small" className="text-neutral-500">
            This will also remove them from all group assignments. This action cannot be undone.
          </Typography>
        </div>
      </Dialog>
    </div>
  );
} 