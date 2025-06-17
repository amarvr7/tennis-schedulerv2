import { useState, useEffect } from 'react';
import { Week, CoachWithGroups, GroupWithWeekData, Location, CoachUnavailability, GroupPreference, ScheduleSlot, Camp, TournamentWithCoaches, TournamentAssignment, Coach, Group } from '@/types';
import { weekService } from '@/lib/services/weekService';
import { coachService } from '@/lib/services/coachService';
import { groupService } from '@/lib/services/groupService';
import { assignmentService } from '@/lib/services/assignmentService';
import { coachUnavailabilityService } from '@/lib/services/coachUnavailabilityService';
import { locationService } from '@/lib/services/locationService';
import { groupPreferenceService } from '@/lib/services/groupPreferenceService';
import { scheduleService } from '@/lib/services/scheduleService';
import { campService } from '@/lib/services/campService';
import { tournamentService } from '@/lib/services/tournamentService';
import { tournamentAssignmentService } from '@/lib/services/tournamentAssignmentService';

export function useWeekData(weekId: string) {
  // State
  const [week, setWeek] = useState<Week | null>(null);
  const [coaches, setCoaches] = useState<CoachWithGroups[]>([]);
  const [groups, setGroups] = useState<GroupWithWeekData[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [unavailabilities, setUnavailabilities] = useState<CoachUnavailability[]>([]);
  const [groupPreferences, setGroupPreferences] = useState<GroupPreference[]>([]);
  const [scheduleTemplate, setScheduleTemplate] = useState<ScheduleSlot[]>([]);
  const [weekCamp, setWeekCamp] = useState<Camp | null>(null);
  const [weekTournaments, setWeekTournaments] = useState<TournamentWithCoaches[]>([]);
  const [tournamentAssignments, setTournamentAssignments] = useState<TournamentAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper function to check if date ranges overlap
  const isDateOverlapping = (start1: Date, end1: Date, start2: Date, end2: Date): boolean => {
    return start1 <= end2 && end1 >= start2;
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [weekData, coachesData, groupsData, assignmentsData, unavailabilityData, locationsData, preferencesData, scheduleData, campData, tournamentsData, tournamentAssignmentsData] = await Promise.all([
        weekService.getById(weekId),
        coachService.getAll(),
        groupService.getAll(),
        assignmentService.getAll(),
        coachUnavailabilityService.getAll(),
        locationService.getAll(),
        groupPreferenceService.getByWeek(weekId),
        scheduleService.getAll(),
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

      // Enhance groups with week-specific data
      const groupsWithWeekData: GroupWithWeekData[] = groupsData.map(group => {
        const groupPrefs = preferencesData.filter(pref => pref.groupId === group.id);
        
        return {
          ...group,
          weekSize: group.size,
          preferences: groupPrefs
        };
      });

      setGroups(groupsWithWeekData);
      
    } catch (error) {
      console.error('Failed to load week data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [weekId]);

  return {
    // Data
    week,
    coaches,
    groups,
    locations,
    unavailabilities,
    groupPreferences,
    scheduleTemplate,
    weekCamp,
    weekTournaments,
    tournamentAssignments,
    loading,
    
    // Methods
    loadData,
    setWeekCamp,
    setGroups,
  };
} 