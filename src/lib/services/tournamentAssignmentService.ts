import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  query, 
  where,
  writeBatch,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { TournamentAssignment, CreateTournamentAssignmentData } from '../../types';

const COLLECTION_NAME = 'tournament_assignments';

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

export const tournamentAssignmentService = {
  // Get all assignments
  async getAll(): Promise<TournamentAssignment[]> {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          tournamentId: data.tournamentId,
          coachId: data.coachId,
          assignedAt: convertTimestamp(data.assignedAt),
        } as TournamentAssignment;
      });
    } catch (error) {
      console.error('Error fetching tournament assignments:', error);
      throw new Error('Failed to fetch tournament assignments');
    }
  },

  // Get assignments for a specific tournament
  async getByTournament(tournamentId: string): Promise<TournamentAssignment[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), where('tournamentId', '==', tournamentId));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          tournamentId: data.tournamentId,
          coachId: data.coachId,
          assignedAt: convertTimestamp(data.assignedAt),
        } as TournamentAssignment;
      });
    } catch (error) {
      console.error('Error fetching tournament assignments:', error);
      throw new Error('Failed to fetch tournament assignments');
    }
  },

  // Get assignments for a specific coach
  async getByCoach(coachId: string): Promise<TournamentAssignment[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), where('coachId', '==', coachId));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          tournamentId: data.tournamentId,
          coachId: data.coachId,
          assignedAt: convertTimestamp(data.assignedAt),
        } as TournamentAssignment;
      });
    } catch (error) {
      console.error('Error fetching coach tournament assignments:', error);
      throw new Error('Failed to fetch coach tournament assignments');
    }
  },

  // Add a single assignment
  async create(assignmentData: CreateTournamentAssignmentData): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...assignmentData,
        assignedAt: convertToTimestamp(new Date()),
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating tournament assignment:', error);
      throw new Error('Failed to create tournament assignment');
    }
  },

  // Assign multiple coaches to a tournament
  async assignCoachesToTournament(tournamentId: string, coachIds: string[]): Promise<void> {
    try {
      const batch = writeBatch(db);
      const now = convertToTimestamp(new Date());
      
      coachIds.forEach(coachId => {
        const docRef = doc(collection(db, COLLECTION_NAME));
        batch.set(docRef, {
          tournamentId,
          coachId,
          assignedAt: now,
        });
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error assigning coaches to tournament:', error);
      throw new Error('Failed to assign coaches to tournament');
    }
  },

  // Update tournament assignments (remove old, add new)
  async updateTournamentAssignments(tournamentId: string, coachIds: string[]): Promise<void> {
    try {
      // First, delete existing assignments
      await this.deleteByTournament(tournamentId);
      
      // Then add new assignments
      if (coachIds.length > 0) {
        await this.assignCoachesToTournament(tournamentId, coachIds);
      }
    } catch (error) {
      console.error('Error updating tournament assignments:', error);
      throw new Error('Failed to update tournament assignments');
    }
  },

  // Delete assignments by tournament
  async deleteByTournament(tournamentId: string): Promise<void> {
    try {
      const q = query(collection(db, COLLECTION_NAME), where('tournamentId', '==', tournamentId));
      const querySnapshot = await getDocs(q);
      
      const batch = writeBatch(db);
      querySnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error deleting tournament assignments:', error);
      throw new Error('Failed to delete tournament assignments');
    }
  },

  // Delete assignments by coach
  async deleteByCoach(coachId: string): Promise<void> {
    try {
      const q = query(collection(db, COLLECTION_NAME), where('coachId', '==', coachId));
      const querySnapshot = await getDocs(q);
      
      const batch = writeBatch(db);
      querySnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error deleting coach tournament assignments:', error);
      throw new Error('Failed to delete coach tournament assignments');
    }
  },

  // Delete a single assignment
  async delete(id: string): Promise<void> {
    try {
      const assignmentRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(assignmentRef);
    } catch (error) {
      console.error('Error deleting tournament assignment:', error);
      throw new Error('Failed to delete tournament assignment');
    }
  },
}; 