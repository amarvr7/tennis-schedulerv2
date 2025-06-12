import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  where,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { Tournament, CreateTournamentData, UpdateTournamentData } from '../../types';
import { weekService } from './weekService';

const COLLECTION_NAME = 'tournaments';

// Helper function to convert Firestore timestamp to Date
const convertTimestamp = (timestamp: any): Date => {
  if (timestamp?.toDate) {
    return timestamp.toDate();
  }
  return timestamp instanceof Date ? timestamp : new Date(timestamp);
};

// Helper function to convert Date to Firestore timestamp
const convertToTimestamp = (date: Date): Timestamp => {
  return Timestamp.fromDate(date);
};

// Helper function to find weeks that overlap with tournament dates
const findOverlappingWeeks = async (startDate: Date, endDate: Date): Promise<string[]> => {
  try {
    const weeks = await weekService.getAll();
    const overlappingWeekIds: string[] = [];

    weeks.forEach(week => {
      const weekStart = new Date(week.startDate);
      const weekEnd = new Date(week.endDate);
      
      // Check if tournament dates overlap with week dates
      const tournamentStart = new Date(startDate);
      const tournamentEnd = new Date(endDate);
      
      if (
        (tournamentStart <= weekEnd && tournamentEnd >= weekStart) ||
        (weekStart <= tournamentEnd && weekEnd >= tournamentStart)
      ) {
        overlappingWeekIds.push(week.id);
      }
    });

    return overlappingWeekIds;
  } catch (error) {
    console.error('Error finding overlapping weeks:', error);
    return [];
  }
};

export const tournamentService = {
  // Get all tournaments
  async getAll(): Promise<Tournament[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('startDate', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          location: data.location,
          startDate: convertTimestamp(data.startDate),
          endDate: convertTimestamp(data.endDate),
          weekIds: data.weekIds || [],
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        } as Tournament;
      });
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      throw new Error('Failed to fetch tournaments');
    }
  },

  // Add a new tournament
  async create(tournamentData: CreateTournamentData): Promise<string> {
    try {
      const now = new Date();
      const { coachIds, ...tournamentFields } = tournamentData;
      
      // Find overlapping weeks based on tournament dates
      const weekIds = await findOverlappingWeeks(tournamentData.startDate, tournamentData.endDate);
      
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...tournamentFields,
        startDate: convertToTimestamp(tournamentData.startDate),
        endDate: convertToTimestamp(tournamentData.endDate),
        weekIds,
        createdAt: convertToTimestamp(now),
        updatedAt: convertToTimestamp(now),
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating tournament:', error);
      throw new Error('Failed to create tournament');
    }
  },

  // Update an existing tournament
  async update(updateData: UpdateTournamentData): Promise<void> {
    try {
      const { id, coachIds, ...data } = updateData;
      const tournamentRef = doc(db, COLLECTION_NAME, id);
      
      const updateFields: any = {
        ...data,
        updatedAt: convertToTimestamp(new Date()),
      };
      
      // Convert dates to timestamps if they exist
      if (data.startDate) {
        updateFields.startDate = convertToTimestamp(data.startDate);
      }
      if (data.endDate) {
        updateFields.endDate = convertToTimestamp(data.endDate);
      }
      
      // Update week associations if dates changed
      if (data.startDate && data.endDate) {
        updateFields.weekIds = await findOverlappingWeeks(data.startDate, data.endDate);
      }
      
      await updateDoc(tournamentRef, updateFields);
    } catch (error) {
      console.error('Error updating tournament:', error);
      throw new Error('Failed to update tournament');
    }
  },

  // Delete a tournament
  async delete(id: string): Promise<void> {
    try {
      const tournamentRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(tournamentRef);
    } catch (error) {
      console.error('Error deleting tournament:', error);
      throw new Error('Failed to delete tournament');
    }
  },
}; 