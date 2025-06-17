"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Loading from '@/components/ui/Loading';
import WeekBuilderLayout from '@/components/admin/week-builder/WeekBuilderLayout';
import WeekBuilderSidebar from '@/components/admin/week-builder/WeekBuilderSidebar';
import CoachAssignmentStep from '@/components/admin/week-builder/steps/CoachAssignmentStep';
import GroupConfigurationStep from '@/components/admin/week-builder/steps/GroupConfigurationStep';
import LocationAssignmentStep from '@/components/admin/week-builder/steps/LocationAssignmentStep';
import ScheduleManagementStep from '@/components/admin/week-builder/steps/ScheduleManagementStep';
import CampManagementStep from '@/components/admin/week-builder/steps/CampManagementStep';
import TournamentSubmitStep from '@/components/admin/week-builder/steps/TournamentSubmitStep';
import { Week, Coach, CoachWithGroups, CoachUnavailability, Group, GroupWithWeekData, GroupWithSchedule, Location, GroupPreference, ScheduleSlot, Camp, CreateCampData, Tournament, TournamentWithCoaches, CreateTournamentData, TournamentAssignment } from '@/types';
import { weekService } from '@/lib/services/weekService';
import { coachService } from '@/lib/services/coachService';
import { groupService } from '@/lib/services/groupService';
import { assignmentService } from '@/lib/services/assignmentService';
import { coachUnavailabilityService } from '@/lib/services/coachUnavailabilityService';
import { locationService } from '@/lib/services/locationService';
import { groupPreferenceService } from '@/lib/services/groupPreferenceService';
import { scheduleService } from '@/lib/services/scheduleService';
import { groupScheduleService } from '@/lib/services/groupScheduleService';
import { campService } from '@/lib/services/campService';
import { tournamentService } from '@/lib/services/tournamentService';
import { tournamentAssignmentService } from '@/lib/services/tournamentAssignmentService';

export default function WeekDetailPage() {
  const params = useParams();
  const router = useRouter();
  const weekId = params.id as string;

  // State
  const [week, setWeek] = useState<Week | null>(null);
  const [coaches, setCoaches] = useState<CoachWithGroups[]>([]);
  const [groups, setGroups] = useState<GroupWithSchedule[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [unavailabilities, setUnavailabilities] = useState<CoachUnavailability[]>([]);
  const [groupPreferences, setGroupPreferences] = useState<GroupPreference[]>([]);
  const [selectedCoaches, setSelectedCoaches] = useState<Set<string>>(new Set());
  const [selectedLocations, setSelectedLocations] = useState<Set<string>>(new Set());
  const [scheduleTemplate, setScheduleTemplate] = useState<ScheduleSlot[]>([]);
  const [weekCamp, setWeekCamp] = useState<Camp | null>(null);
  const [editingCamp, setEditingCamp] = useState(false);
  const [weekTournaments, setWeekTournaments] = useState<TournamentWithCoaches[]>([]);
  const [tournamentAssignments, setTournamentAssignments] = useState<TournamentAssignment[]>([]);
  const [showTournamentForm, setShowTournamentForm] = useState(false);
  const [editingTournament, setEditingTournament] = useState<TournamentWithCoaches | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [weekId]);

  // Helper function to check if date ranges overlap
  const isDateOverlapping = (start1: Date, end1: Date, start2: Date, end2: Date): boolean => {
    return start1 <= end2 && end1 >= start2;
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [weekData, coachesData, groupsData, assignmentsData, unavailabilityData, locationsData, preferencesData, scheduleData, groupScheduleData, campData, tournamentsData, tournamentAssignmentsData] = await Promise.all([
        weekService.getById(weekId),
        coachService.getAll(),
        groupService.getAll(),
        assignmentService.getAll(),
        coachUnavailabilityService.getAll(),
        locationService.getAll(),
        groupPreferenceService.getByWeek(weekId),
        scheduleService.getAll(),
        groupScheduleService.getAll(),
        campService.getByWeek(weekId),
        tournamentService.getAll(),
        tournamentAssignmentService.getAll()
      ]);

      setWeek(weekData);
      setUnavailabilities(unavailabilityData);
      setLocations(locationsData);
      setGroupPreferences(preferencesData);
      setScheduleTemplate(scheduleData);
      setWeekCamp(campData);
      setTournamentAssignments(tournamentAssignmentsData);

      // Filter tournaments that overlap with this week
      if (weekData) {
        const overlappingTournaments = tournamentsData.filter(tournament => {
          return tournament.weekIds.includes(weekId) || isDateOverlapping(
            weekData.startDate,
            weekData.endDate,
            tournament.startDate,
            tournament.endDate
          );
        });

        // Enhance tournaments with coach information
        const tournamentsWithCoaches: TournamentWithCoaches[] = overlappingTournaments.map(tournament => {
          const tournamentCoachAssignments = tournamentAssignmentsData.filter(a => a.tournamentId === tournament.id);
          const tournamentCoaches = tournamentCoachAssignments
            .map(assignment => coachesData.find(coach => coach.id === assignment.coachId))
            .filter(Boolean) as Coach[];

          return {
            ...tournament,
            coaches: tournamentCoaches,
            coachCount: tournamentCoaches.length
          };
        });

        setWeekTournaments(tournamentsWithCoaches);
      }

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

      // Enhance groups with schedule data
      const groupsWithSchedule: GroupWithSchedule[] = groupsData.map(group => {
        const groupPrefs = preferencesData.filter(pref => pref.groupId === group.id);
        const groupSlots = groupScheduleData.filter(slot => slot.groupId === group.id);
        
        return {
          ...group,
          weekSize: group.size,
          preferences: groupPrefs,
          scheduleSlots: groupSlots
        };
      });

      setGroups(groupsWithSchedule);
      
      // Select all coaches and locations by default
      const allCoachIds = new Set(coachesWithGroups.map(coach => coach.id));
      setSelectedCoaches(allCoachIds);
      
      const allLocationIds = new Set(locationsData.map(location => location.id));
      setSelectedLocations(allLocationIds);
      
    } catch (error) {
      console.error('Failed to load week data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handler functions for step components
  const handleCoachToggle = (coachId: string) => {
    const newSelected = new Set(selectedCoaches);
    if (newSelected.has(coachId)) {
      newSelected.delete(coachId);
    } else {
      newSelected.add(coachId);
    }
    setSelectedCoaches(newSelected);
  };

  const handleLocationToggle = (locationId: string) => {
    const newSelected = new Set(selectedLocations);
    if (newSelected.has(locationId)) {
      newSelected.delete(locationId);
    } else {
      newSelected.add(locationId);
    }
    setSelectedLocations(newSelected);
  };

  const handleGroupSizeChange = (groupId: string, newSize: number) => {
    setGroups(prevGroups => 
      prevGroups.map(group => 
        group.id === groupId 
          ? { ...group, weekSize: newSize }
          : group
      )
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <Loading size="lg" />
      </div>
    );
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <CoachAssignmentStep
            coaches={coaches}
            selectedCoaches={selectedCoaches}
            unavailabilities={unavailabilities}
            week={week}
            loading={loading}
            saving={saving}
            onCoachToggle={handleCoachToggle}
            onSave={async () => {
              setSaving(true);
              try {
                // Save selected coaches - for now just proceed to next step
                // TODO: Implement week-specific coach assignment persistence
                setCurrentStep(2);
              } catch (error) {
                console.error('Failed to save coach assignments:', error);
              } finally {
                setSaving(false);
              }
            }}
            onSelectAll={() => {
              const allCoachIds = new Set(coaches.map(coach => coach.id));
              setSelectedCoaches(allCoachIds);
            }}
            onUnselectAll={() => setSelectedCoaches(new Set())}
          />
        );
      case 2:
        return (
          <GroupConfigurationStep
            groups={groups}
            groupPreferences={groupPreferences}
            locations={locations}
            loading={loading}
            saving={saving}
            weekId={weekId}
            onGroupSizeChange={handleGroupSizeChange}
            onSave={() => setCurrentStep(3)}
            onPrevious={() => setCurrentStep(1)}
          />
        );
      case 3:
        return (
          <LocationAssignmentStep
            locations={locations}
            selectedLocations={selectedLocations}
            loading={loading}
            saving={saving}
            onLocationToggle={handleLocationToggle}
            onSave={() => setCurrentStep(4)}
            onPrevious={() => setCurrentStep(2)}
            onSelectAll={() => {
              const allLocationIds = new Set(locations.map(location => location.id));
              setSelectedLocations(allLocationIds);
            }}
            onUnselectAll={() => setSelectedLocations(new Set())}
          />
        );
      case 4:
        return (
          <ScheduleManagementStep
            groups={groups}
            locations={locations}
            saving={saving}
            onGroupsUpdate={setGroups}
            onSave={() => setCurrentStep(5)}
            onPrevious={() => setCurrentStep(3)}
          />
        );
      case 5:
        return (
          <CampManagementStep
            weekCamp={weekCamp}
            week={week!}
            editingCamp={editingCamp}
            saving={saving}
            onCreateCamp={async () => {
              setSaving(true);
              try {
                const newCampData: CreateCampData = {
                  weekId,
                  juniorPlayers: 0,
                  adultPlayers: {
                    monday: 0,
                    tuesday: 0,
                    wednesday: 0,
                    thursday: 0,
                    friday: 0,
                    saturday: 0,
                    sunday: 0
                  }
                };
                const campId = await campService.create(newCampData);
                const newCamp = await campService.getByWeek(weekId);
                setWeekCamp(newCamp);
                setEditingCamp(true);
              } catch (error) {
                console.error('Failed to create camp:', error);
              } finally {
                setSaving(false);
              }
            }}
            onEditCamp={() => setEditingCamp(true)}
            onSaveCamp={async (campData) => {
              setSaving(true);
              try {
                if (weekCamp) {
                  await campService.update({ id: weekCamp.id, ...campData });
                  const updatedCamp = await campService.getByWeek(weekId);
                  setWeekCamp(updatedCamp);
                }
                setEditingCamp(false);
              } catch (error) {
                console.error('Failed to save camp:', error);
              } finally {
                setSaving(false);
              }
            }}
            onDeleteCamp={async () => {
              setSaving(true);
              try {
                if (weekCamp) {
                  await campService.delete(weekCamp.id);
                  setWeekCamp(null);
                }
              } catch (error) {
                console.error('Failed to delete camp:', error);
              } finally {
                setSaving(false);
              }
            }}
            onCancelEdit={() => setEditingCamp(false)}
            onSave={() => setCurrentStep(6)}
            onPrevious={() => setCurrentStep(4)}
          />
        );
      case 6:
        return (
          <TournamentSubmitStep
            weekTournaments={weekTournaments}
            coaches={coaches}
            week={week!}
            showTournamentForm={showTournamentForm}
            editingTournament={editingTournament}
            saving={saving}
            onCreateTournament={async (tournamentData) => {
              setSaving(true);
              try {
                await tournamentService.create(tournamentData);
                // Reload tournaments to get updated list
                await loadData();
                setShowTournamentForm(false);
              } catch (error) {
                console.error('Failed to create tournament:', error);
              } finally {
                setSaving(false);
              }
            }}
            onEditTournament={async (tournamentData) => {
              setSaving(true);
              try {
                if (editingTournament) {
                  await tournamentService.update({ id: editingTournament.id, ...tournamentData });
                  // Reload tournaments to get updated list
                  await loadData();
                  setShowTournamentForm(false);
                  setEditingTournament(null);
                }
              } catch (error) {
                console.error('Failed to update tournament:', error);
              } finally {
                setSaving(false);
              }
            }}
            onDeleteTournament={async (tournament) => {
              setSaving(true);
              try {
                await tournamentService.delete(tournament.id);
                // Reload tournaments to get updated list
                await loadData();
              } catch (error) {
                console.error('Failed to delete tournament:', error);
              } finally {
                setSaving(false);
              }
            }}
            onEditClick={(tournament) => {
              setEditingTournament(tournament);
              setShowTournamentForm(true);
            }}
            onShowForm={() => {
              setEditingTournament(null);
              setShowTournamentForm(true);
            }}
            onCloseForm={() => {
              setShowTournamentForm(false);
              setEditingTournament(null);
            }}
            onFinalSubmit={async () => {
              setSaving(true);
              try {
                // TODO: Implement proper week submission logic
                // For now, just navigate back to weeks list
                alert('Week configured successfully!');
                router.push('/admin/weeks');
              } catch (error) {
                console.error('Failed to submit week:', error);
              } finally {
                setSaving(false);
              }
            }}
            onPrevious={() => setCurrentStep(5)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <WeekBuilderLayout
      week={week}
      onBack={() => router.push('/admin/weeks')}
      sidebar={
        <WeekBuilderSidebar
          currentStep={currentStep}
          onStepClick={setCurrentStep}
        />
      }
    >
      {renderCurrentStep()}
    </WeekBuilderLayout>
  );
} 