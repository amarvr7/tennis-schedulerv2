/**
 * Central export point for all shared types
 * Only add exports here when types are used in multiple files
 */

// Example: export * from './models/User'; 

// Coach types
export interface Coach {
  id: string;
  name: string;
  role: 'head' | 'assistant';
  email: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCoachData {
  name: string;
  role: 'head' | 'assistant';
  email: string;
  phone: string;
}

export interface UpdateCoachData extends Partial<CreateCoachData> {
  id: string;
}

// Group types
export interface Group {
  id: string;
  name: string;
  size: number; // Number of players in the group
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateGroupData {
  name: string;
  size: number;
  coachIds?: string[];
}

export interface UpdateGroupData extends Partial<CreateGroupData> {
  id: string;
}

// Coach Assignment types (many-to-many relationship)
export interface CoachAssignment {
  id: string;
  coachId: string;
  groupId: string;
  assignedAt: Date;
}

export interface CreateAssignmentData {
  coachId: string;
  groupId: string;
}

// Location types
export interface Location {
  id: string;
  name: string;
  surfaceType: 'Hard' | 'Clay' | 'Red Clay' | 'Indoor';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLocationData {
  name: string;
  surfaceType: 'Hard' | 'Clay' | 'Red Clay' | 'Indoor';
  adjacentLocationIds?: string[];
}

export interface UpdateLocationData extends Partial<CreateLocationData> {
  id: string;
}

// Location Adjacency types (many-to-many relationship)
export interface LocationAdjacency {
  id: string;
  locationId1: string;
  locationId2: string;
  createdAt: Date;
}

export interface CreateAdjacencyData {
  locationId1: string;
  locationId2: string;
}

// Schedule types
export interface ScheduleSlot {
  id: string;
  day: string; // "monday", "tuesday", etc.
  timeSlot: string; // "09:00", "09:30", etc.
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateScheduleSlotData {
  day: string;
  timeSlot: string;
  isActive: boolean;
}

export interface UpdateScheduleSlotData extends Partial<CreateScheduleSlotData> {
  id: string;
}

// Coach Unavailability types
export interface CoachUnavailability {
  id: string;
  coachId: string;
  startDate: Date;
  endDate: Date;
  startTime?: string; // "09:00" format, undefined if all-day
  endTime?: string; // "17:30" format, undefined if all-day
  isAllDay: boolean;
  reason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCoachUnavailabilityData {
  coachId: string;
  startDate: Date;
  endDate: Date;
  startTime?: string;
  endTime?: string;
  isAllDay: boolean;
  reason?: string;
}

export interface UpdateCoachUnavailabilityData extends Partial<CreateCoachUnavailabilityData> {
  id: string;
}

// Enhanced types with relationships
export interface CoachWithGroups extends Coach {
  groups?: Group[];
}

export interface GroupWithCoaches extends Group {
  coaches?: Coach[];
  coachCount?: number;
}

export interface LocationWithAdjacent extends Location {
  adjacentLocations?: Location[];
  adjacentCount?: number;
}

export interface CoachUnavailabilityWithCoach extends CoachUnavailability {
  coach?: Coach;
}

// Generic table types for reusable components
export interface TableColumn<T = any> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

// Week types
export interface Week {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWeekData {
  name: string;
  startDate: Date;
  endDate: Date;
}

export interface UpdateWeekData extends Partial<CreateWeekData> {
  id: string;
}

// Camp types
export interface Camp {
  id: string;
  weekId: string;
  juniorPlayers: number;
  adultPlayers: { [day: string]: number }; // e.g., { "monday": 5, "tuesday": 3 }
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCampData {
  weekId: string;
  juniorPlayers: number;
  adultPlayers: { [day: string]: number };
}

export interface UpdateCampData extends Partial<CreateCampData> {
  id: string;
}

// Enhanced types with relationships
export interface CampWithWeek extends Camp {
  week?: Week;
}

// Coach Preference types
export interface CoachPreference {
  id: string;
  coachId: string;
  weekId: string;
  preferenceType: 'location' | 'surface';
  locationIds?: string[]; // if preferenceType is 'location' - array for multiple
  surfaceType?: 'Hard' | 'Clay' | 'Red Clay' | 'Indoor'; // if preferenceType is 'surface'
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCoachPreferenceData {
  coachId: string;
  weekId: string;
  preferenceType: 'location' | 'surface';
  locationIds?: string[];
  surfaceType?: 'Hard' | 'Clay' | 'Red Clay' | 'Indoor';
}

export interface UpdateCoachPreferenceData extends Partial<CreateCoachPreferenceData> {
  id: string;
}

export interface CoachPreferenceWithDetails extends CoachPreference {
  coach?: Coach;
  week?: Week;
  locations?: Location[];
}

// Tournament types
export interface Tournament {
  id: string;
  name: string;
  location: string;
  startDate: Date;
  endDate: Date;
  weekIds: string[]; // Auto-assigned based on dates
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTournamentData {
  name: string;
  location: string;
  startDate: Date;
  endDate: Date;
  coachIds?: string[];
}

export interface UpdateTournamentData extends Partial<CreateTournamentData> {
  id: string;
}

export interface TournamentAssignment {
  id: string;
  tournamentId: string;
  coachId: string;
  assignedAt: Date;
}

export interface CreateTournamentAssignmentData {
  tournamentId: string;
  coachId: string;
}

export interface TournamentWithCoaches extends Tournament {
  coaches?: Coach[];
  coachCount?: number;
  weeks?: Week[];
} 