"use client";

import { useState, useEffect, useCallback } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, TrophyIcon } from '@heroicons/react/24/outline';
import Typography from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import DataTable from '@/components/ui/DataTable';
import Dialog from '@/components/ui/Dialog';
import TournamentForm from '@/components/ui/TournamentForm';
import Badge from '@/components/ui/Badge';
import { Tournament, CreateTournamentData, TableColumn, Coach, TournamentWithCoaches, Week } from '@/types';
import { tournamentService } from '@/lib/services/tournamentService';
import { coachService } from '@/lib/services/coachService';
import { tournamentAssignmentService } from '@/lib/services/tournamentAssignmentService';
import { weekService } from '@/lib/services/weekService';

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<TournamentWithCoaches[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTournament, setEditingTournament] = useState<TournamentWithCoaches | null>(null);
  const [editingCoachIds, setEditingCoachIds] = useState<string[]>([]);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<TournamentWithCoaches | null>(null);

  // Load tournaments and related data on component mount
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [tournamentsData, coachesData, assignmentsData, weeksData] = await Promise.all([
        tournamentService.getAll(),
        coachService.getAll(),
        tournamentAssignmentService.getAll(),
        weekService.getAll()
      ]);

      // Enhance tournaments with coach and week information
      const tournamentsWithCoaches: TournamentWithCoaches[] = tournamentsData.map(tournament => {
        const tournamentAssignments = assignmentsData.filter(a => a.tournamentId === tournament.id);
        const tournamentCoaches = tournamentAssignments
          .map(assignment => coachesData.find(coach => coach.id === assignment.coachId))
          .filter(Boolean) as Coach[];

        const tournamentWeeks = tournament.weekIds
          .map(weekId => weeksData.find(week => week.id === weekId))
          .filter(Boolean) as Week[];

        return {
          ...tournament,
          coaches: tournamentCoaches,
          coachCount: tournamentCoaches.length,
          weeks: tournamentWeeks
        };
      });

      setTournaments(tournamentsWithCoaches);
      setCoaches(coachesData);
      setWeeks(weeksData);
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

  const handleAddTournament = useCallback(async (tournamentData: CreateTournamentData) => {
    try {
      setFormLoading(true);
      const tournamentId = await tournamentService.create(tournamentData);
      
      // Assign coaches to the tournament if any were selected
      if (tournamentData.coachIds && tournamentData.coachIds.length > 0) {
        await tournamentAssignmentService.assignCoachesToTournament(tournamentId, tournamentData.coachIds);
      }
      
      setShowAddModal(false);
      await loadData(); // Reload the list
      // TODO: Add success toast
    } catch (error) {
      console.error('Failed to add tournament:', error);
      // TODO: Add error toast
    } finally {
      setFormLoading(false);
    }
  }, [loadData]);

  const handleEditTournament = useCallback(async (tournamentData: CreateTournamentData) => {
    if (!editingTournament) return;

    try {
      setFormLoading(true);
      
      // Update tournament basic info
      await tournamentService.update({
        id: editingTournament.id,
        name: tournamentData.name,
        location: tournamentData.location,
        startDate: tournamentData.startDate,
        endDate: tournamentData.endDate
      });
      
      // Update coach assignments
      if (tournamentData.coachIds) {
        await tournamentAssignmentService.updateTournamentAssignments(editingTournament.id, tournamentData.coachIds);
      }
      
      setEditingTournament(null);
      setEditingCoachIds([]);
      await loadData(); // Reload the list
      // TODO: Add success toast
    } catch (error) {
      console.error('Failed to update tournament:', error);
      // TODO: Add error toast
    } finally {
      setFormLoading(false);
    }
  }, [editingTournament, loadData]);

  const handleDeleteTournament = useCallback(async (tournament: TournamentWithCoaches) => {
    try {
      // Delete tournament and all its assignments
      await Promise.all([
        tournamentService.delete(tournament.id),
        tournamentAssignmentService.deleteByTournament(tournament.id)
      ]);
      
      setDeleteConfirm(null);
      await loadData(); // Reload the list
      // TODO: Add success toast
    } catch (error) {
      console.error('Failed to delete tournament:', error);
      // TODO: Add error toast
    }
  }, [loadData]);

  const handleEditClick = useCallback(async (tournament: TournamentWithCoaches) => {
    try {
      // Get current coach assignments for this tournament
      const assignments = await tournamentAssignmentService.getByTournament(tournament.id);
      const coachIds = assignments.map(a => a.coachId);
      
      setEditingCoachIds(coachIds);
      setEditingTournament(tournament);
    } catch (error) {
      console.error('Failed to load tournament assignments:', error);
      // TODO: Add error toast
    }
  }, []);

  // Define table columns
  const columns: TableColumn<TournamentWithCoaches>[] = [
    {
      key: 'name',
      label: 'Tournament',
      sortable: true,
      render: (value, tournament) => (
        <div>
          <Typography weight="medium">{value}</Typography>
          <Typography variant="small" className="text-neutral-500">
            {tournament.location}
          </Typography>
        </div>
      )
    },
    {
      key: 'startDate',
      label: 'Dates',
      sortable: true,
      render: (value, tournament) => (
        <div>
          <Typography variant="small" weight="medium">
            {new Date(value).toLocaleDateString()} - {new Date(tournament.endDate).toLocaleDateString()}
          </Typography>
          <Typography variant="small" className="text-neutral-500">
            {tournament.weeks && tournament.weeks.length > 0 && (
              `Week${tournament.weeks.length > 1 ? 's' : ''}: ${tournament.weeks.map(w => w.name).join(', ')}`
            )}
          </Typography>
        </div>
      )
    },
    {
      key: 'coaches',
      label: 'Coaches',
      sortable: false,
      render: (value: Coach[], tournament) => (
        <div className="flex flex-wrap gap-1">
          {value && value.length > 0 ? (
            value.map(coach => (
              <span 
                key={coach.id}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-tertiary-100 text-tertiary-700"
              >
                {coach.name}
              </span>
            ))
          ) : (
            <Typography variant="small" className="text-neutral-400">
              No coaches
            </Typography>
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
  ];

  // Define row actions
  const rowActions = (tournament: TournamentWithCoaches) => (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleEditClick(tournament)}
      >
        <PencilIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="error"
        size="sm"
        onClick={() => setDeleteConfirm(tournament)}
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
            Tournaments
          </Typography>
          <Typography variant="lead" className="text-neutral-600">
            Manage tournament events and coach assignments
          </Typography>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowAddModal(true)}
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Tournament
        </Button>
      </div>

      {/* Tournaments Table */}
      <DataTable
        data={tournaments}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search tournaments..."
        actions={rowActions}
        emptyMessage="No tournaments found. Add your first tournament to get started."
      />

      {/* Add Tournament Modal */}
      <Dialog
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Tournament"
        size="lg"
      >
        <TournamentForm
          onSubmit={handleAddTournament}
          onCancel={() => setShowAddModal(false)}
          loading={formLoading}
          coaches={coaches}
        />
      </Dialog>

      {/* Edit Tournament Modal */}
      <Dialog
        isOpen={!!editingTournament}
        onClose={() => setEditingTournament(null)}
        title="Edit Tournament"
        size="lg"
      >
        {editingTournament && (
          <TournamentForm
            initialData={editingTournament}
            onSubmit={handleEditTournament}
            onCancel={() => setEditingTournament(null)}
            loading={formLoading}
            isEdit
            coaches={coaches}
            initialCoachIds={editingCoachIds}
          />
        )}
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Tournament"
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
              onClick={() => deleteConfirm && handleDeleteTournament(deleteConfirm)}
            >
              Delete Tournament
            </Button>
          </>
        }
      >
        <div className="py-4">
          <Typography className="mb-4">
            Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>? 
          </Typography>
          <Typography variant="small" className="text-neutral-500">
            This will also remove all coach assignments for this tournament. This action cannot be undone.
          </Typography>
        </div>
      </Dialog>
    </div>
  );
} 