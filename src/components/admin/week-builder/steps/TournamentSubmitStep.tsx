"use client";

import { TrophyIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import Typography from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Dialog from '@/components/ui/Dialog';
import TournamentForm from '@/components/ui/TournamentForm';
import { TournamentWithCoaches, CreateTournamentData, CoachWithGroups, Week } from '@/types';

interface TournamentSubmitStepProps {
  weekTournaments: TournamentWithCoaches[];
  coaches: CoachWithGroups[];
  week: Week;
  showTournamentForm: boolean;
  editingTournament: TournamentWithCoaches | null;
  saving: boolean;
  onCreateTournament: (data: CreateTournamentData) => void;
  onEditTournament: (data: CreateTournamentData) => void;
  onDeleteTournament: (tournament: TournamentWithCoaches) => void;
  onEditClick: (tournament: TournamentWithCoaches) => void;
  onShowForm: () => void;
  onCloseForm: () => void;
  onFinalSubmit: () => void;
  onPrevious: () => void;
}

export default function TournamentSubmitStep({
  weekTournaments,
  coaches,
  week,
  showTournamentForm,
  editingTournament,
  saving,
  onCreateTournament,
  onEditTournament,
  onDeleteTournament,
  onEditClick,
  onShowForm,
  onCloseForm,
  onFinalSubmit,
  onPrevious
}: TournamentSubmitStepProps) {

  return (
    <>
      <Card>
        <div className="p-6">
          <div className="flex items-center mb-6">
            <TrophyIcon className="h-6 w-6 text-primary-600 mr-3" />
            <div>
              <Typography variant="h2" weight="semibold">
                Step 6: Tournaments & Submit
              </Typography>
              <Typography variant="small" className="text-neutral-600 mt-1">
                Review tournaments overlapping with this week, then submit for final approval
              </Typography>
            </div>
          </div>

          {/* Tournament Management */}
          <div className="space-y-6">
            {/* Tournament List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Typography variant="h3" weight="medium" className="mb-1">
                    Week Tournaments
                  </Typography>
                  <Typography variant="small" className="text-neutral-600">
                    Tournaments that overlap with {week.name} ({new Date(week.startDate).toLocaleDateString()} - {new Date(week.endDate).toLocaleDateString()})
                  </Typography>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onShowForm}
                  disabled={saving}
                >
                  <TrophyIcon className="h-4 w-4 mr-2" />
                  Add Tournament
                </Button>
              </div>

              {weekTournaments.length > 0 ? (
                <div className="space-y-4">
                  {weekTournaments.map(tournament => (
                    <TournamentCard
                      key={tournament.id}
                      tournament={tournament}
                      onEdit={onEditClick}
                      onDelete={onDeleteTournament}
                      loading={saving}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-neutral-50 rounded-lg">
                  <TrophyIcon className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                  <Typography variant="h3" weight="medium" className="mb-2">
                    No Tournaments
                  </Typography>
                  <Typography className="text-neutral-500 mb-6">
                    No tournaments overlap with this week. Create one to manage events and coach assignments.
                  </Typography>
                  <Button
                    variant="primary"
                    onClick={onShowForm}
                    disabled={saving}
                  >
                    <TrophyIcon className="h-4 w-4 mr-2" />
                    Create Tournament
                  </Button>
                </div>
              )}
            </div>

            {/* Final Actions */}
            <div className="border-t pt-6 mt-6">
              <div className="flex items-center justify-between">
                <div>
                  <Typography weight="medium">
                    Ready to Submit Week
                  </Typography>
                  <Typography variant="small" className="text-neutral-500 mt-1">
                    All settings configured. {weekTournaments.length} tournament{weekTournaments.length !== 1 ? 's' : ''} for this week.
                  </Typography>
                </div>
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={onPrevious}
                  >
                    Back to Camps
                  </Button>
                  <Button
                    variant="primary"
                    onClick={onFinalSubmit}
                    disabled={saving}
                  >
                    {saving ? 'Submitting...' : 'Submit Week'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Tournament Form Modal */}
      {showTournamentForm && (
        <Dialog
          isOpen={showTournamentForm}
          onClose={onCloseForm}
          title={editingTournament ? "Edit Tournament" : "Add Tournament"}
          size="lg"
        >
          <TournamentForm
            initialData={editingTournament ? {
              ...editingTournament,
              coachIds: editingTournament.coaches?.map(c => c.id) || []
            } : {
              startDate: week.startDate,
              endDate: week.endDate
            }}
            onSubmit={editingTournament ? onEditTournament : onCreateTournament}
            onCancel={onCloseForm}
            loading={saving}
            isEdit={!!editingTournament}
            coaches={coaches}
            initialCoachIds={editingTournament?.coaches?.map(c => c.id) || []}
          />
        </Dialog>
      )}
    </>
  );
}

// Tournament Card Component (previously inline)
function TournamentCard({ 
  tournament, 
  onEdit, 
  onDelete, 
  loading 
}: { 
  tournament: TournamentWithCoaches; 
  onEdit: (tournament: TournamentWithCoaches) => void;
  onDelete: (tournament: TournamentWithCoaches) => void;
  loading: boolean;
}) {
  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <TrophyIcon className="h-5 w-5 text-amber-500 mr-2" />
            <Typography weight="medium" className="text-lg">
              {tournament.name}
            </Typography>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
            <div className="flex flex-col gap-1">
              <Typography variant="small" className="text-neutral-500">Location</Typography>
              <Typography variant="small" weight="medium">{tournament.location}</Typography>
            </div>
            
            <div className="flex flex-col gap-1">
              <Typography variant="small" className="text-neutral-500">Dates</Typography>
              <Typography variant="small" weight="medium">
                {new Date(tournament.startDate).toLocaleDateString()} - {new Date(tournament.endDate).toLocaleDateString()}
              </Typography>
            </div>
            
            <div className="flex flex-col gap-1">
              <Typography variant="small" className="text-neutral-500">Coaches</Typography>
              <Typography variant="small" weight="medium">
                {tournament.coaches && tournament.coaches.length > 0 
                  ? `${tournament.coaches.length} assigned`
                  : 'No coaches assigned'
                }
              </Typography>
            </div>
          </div>

          {tournament.coaches && tournament.coaches.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tournament.coaches.map(coach => (
                <Badge key={coach.id} variant="default" size="sm">
                  {coach.name}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex space-x-2 ml-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(tournament)}
            disabled={loading}
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="error"
            size="sm"
            onClick={() => onDelete(tournament)}
            disabled={loading}
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 