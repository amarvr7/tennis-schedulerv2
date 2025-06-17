"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import Typography from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import DataTable from '@/components/ui/DataTable';
import Dialog from '@/components/ui/Dialog';
import GroupForm from '@/components/ui/GroupForm';
import Badge from '@/components/ui/Badge';
import { Group, CreateGroupData, TableColumn, Coach, GroupWithCoaches } from '@/types';
import { groupService } from '@/lib/services/groupService';
import { coachService } from '@/lib/services/coachService';
import { assignmentService } from '@/lib/services/assignmentService';

export default function GroupsPage() {
  const [groups, setGroups] = useState<GroupWithCoaches[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<GroupWithCoaches | null>(null);
  const [editingCoachIds, setEditingCoachIds] = useState<string[]>([]);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<GroupWithCoaches | null>(null);

  // Memoize loadData to prevent infinite re-renders
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [groupsData, coachesData, assignmentsData] = await Promise.all([
        groupService.getAll(),
        coachService.getAll(),
        assignmentService.getAll()
      ]);

      // Enhance groups with coach information
      const groupsWithCoaches: GroupWithCoaches[] = groupsData.map(group => {
        const groupAssignments = assignmentsData.filter(a => a.groupId === group.id);
        const groupCoaches = groupAssignments
          .map(assignment => coachesData.find(coach => coach.id === assignment.coachId))
          .filter(Boolean) as Coach[];

        return {
          ...group,
          coaches: groupCoaches,
          coachCount: groupCoaches.length
        };
      });

      setGroups(groupsWithCoaches);
      setCoaches(coachesData);
    } catch (error) {
      console.error('Failed to load data:', error);
      // TODO: Add toast notification for error
    } finally {
      setLoading(false);
    }
  }, []);

  // Load groups and coaches on component mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddGroup = useCallback(async (groupData: CreateGroupData) => {
    try {
      setFormLoading(true);
      const groupId = await groupService.create(groupData);
      
      // Assign coaches to the group if any were selected
      if (groupData.coachIds && groupData.coachIds.length > 0) {
        await assignmentService.assignCoachesToGroup(groupId, groupData.coachIds);
      }
      
      setShowAddModal(false);
      await loadData(); // Reload the list
      // TODO: Add success toast
    } catch (error) {
      console.error('Failed to add group:', error);
      // TODO: Add error toast
    } finally {
      setFormLoading(false);
    }
  }, [loadData]);

  const handleEditGroup = useCallback(async (groupData: CreateGroupData) => {
    if (!editingGroup) return;

    try {
      setFormLoading(true);
      
      // Update group basic info
      await groupService.update({
        id: editingGroup.id,
        name: groupData.name,
        size: groupData.size,
        color: groupData.color
      });
      
      // Update coach assignments
      if (groupData.coachIds) {
        await assignmentService.updateGroupAssignments(editingGroup.id, groupData.coachIds);
      }
      
      setEditingGroup(null);
      setEditingCoachIds([]);
      await loadData(); // Reload the list
      // TODO: Add success toast
    } catch (error) {
      console.error('Failed to update group:', error);
      // TODO: Add error toast
    } finally {
      setFormLoading(false);
    }
  }, [editingGroup, loadData]);

  const handleDeleteGroup = useCallback(async (group: GroupWithCoaches) => {
    try {
      // Delete group and all its assignments
      await Promise.all([
        groupService.delete(group.id),
        assignmentService.deleteByGroup(group.id)
      ]);
      
      setDeleteConfirm(null);
      await loadData(); // Reload the list
      // TODO: Add success toast
    } catch (error) {
      console.error('Failed to delete group:', error);
      // TODO: Add error toast
    }
  }, [loadData]);

  const handleEditClick = useCallback(async (group: GroupWithCoaches) => {
    try {
      // Get current coach assignments for this group
      const assignments = await assignmentService.getByGroup(group.id);
      const coachIds = assignments.map(a => a.coachId);
      
      setEditingCoachIds(coachIds);
      setEditingGroup(group);
    } catch (error) {
      console.error('Failed to load group assignments:', error);
      // TODO: Add error toast
    }
  }, []);

  // Memoize table columns to prevent recreation
  const columns = useMemo((): TableColumn<GroupWithCoaches>[] => [
    {
      key: 'name',
      label: 'Group Name',
      sortable: true,
      render: (value, group) => (
        <div className="flex items-center">
          {group.color ? (
            <div 
              className="w-4 h-4 rounded-full border border-neutral-300 mr-3 flex-shrink-0"
              style={{ backgroundColor: group.color }}
            />
          ) : (
            <UserGroupIcon className="h-5 w-5 text-neutral-400 mr-2" />
          )}
          <Typography weight="medium">{value}</Typography>
        </div>
      )
    },
    {
      key: 'size',
      label: 'Players',
      sortable: true,
      render: (value) => (
        <Badge variant="primary" size="sm">
          {value || 8} player{(value || 8) === 1 ? '' : 's'}
        </Badge>
      )
    },
    {
      key: 'coachCount',
      label: 'Coaches',
      sortable: true,
      render: (value, group) => (
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" size="sm">
            {value || 0} coach{(value || 0) === 1 ? '' : 'es'}
          </Badge>
          {group.coaches && group.coaches.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {group.coaches.slice(0, 2).map(coach => (
                <span 
                  key={coach.id}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-neutral-100 text-neutral-700"
                >
                  {coach.name}
                </span>
              ))}
              {group.coaches.length > 2 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-neutral-100 text-neutral-700">
                  +{group.coaches.length - 2} more
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
  const rowActions = useCallback((group: GroupWithCoaches) => (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleEditClick(group)}
      >
        <PencilIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="error"
        size="sm"
        onClick={() => setDeleteConfirm(group)}
      >
        <TrashIcon className="h-4 w-4" />
      </Button>
    </div>
  ), [handleEditClick]);

  // Memoize stable coach IDs array
  const stableEditingCoachIds = useMemo(() => [...editingCoachIds], [editingCoachIds.join(',')]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <Typography variant="h1" weight="bold" className="mb-2">
            Groups
          </Typography>
          <Typography variant="lead" className="text-neutral-600">
            Organize coaches into groups
          </Typography>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowAddModal(true)}
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Group
        </Button>
      </div>

      {/* Groups Table */}
      <DataTable
        data={groups}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search groups..."
        actions={rowActions}
        emptyMessage="No groups found. Create your first group to get started."
      />

      {/* Add Group Modal */}
      <Dialog
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Create New Group"
        size="lg"
      >
        <GroupForm
          onSubmit={handleAddGroup}
          onCancel={() => setShowAddModal(false)}
          loading={formLoading}
          coaches={coaches}
        />
      </Dialog>

      {/* Edit Group Modal */}
      <Dialog
        isOpen={!!editingGroup}
        onClose={() => {
          setEditingGroup(null);
          setEditingCoachIds([]);
        }}
        title="Edit Group"
        size="lg"
      >
        {editingGroup && (
          <GroupForm
            initialData={editingGroup}
            initialCoachIds={stableEditingCoachIds}
            onSubmit={handleEditGroup}
            onCancel={() => {
              setEditingGroup(null);
              setEditingCoachIds([]);
            }}
            loading={formLoading}
            coaches={coaches}
            isEdit
          />
        )}
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Group"
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
              onClick={() => deleteConfirm && handleDeleteGroup(deleteConfirm)}
            >
              Delete Group
            </Button>
          </>
        }
      >
        <div className="py-4">
          <Typography className="mb-4">
            Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>?
          </Typography>
          {deleteConfirm?.coachCount && deleteConfirm.coachCount > 0 && (
            <Typography variant="small" className="text-warning-600">
              This will also remove all coach assignments from this group.
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