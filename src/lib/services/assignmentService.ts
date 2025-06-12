import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  query, 
  where,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { CoachAssignment, CreateAssignmentData } from '../../types';

const COLLECTION_NAME = 'coach_assignments';

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

export const assignmentService = {
  // Get all assignments
  async getAll(): Promise<CoachAssignment[]> {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          coachId: data.coachId,
          groupId: data.groupId,
          assignedAt: convertTimestamp(data.assignedAt),
        } as CoachAssignment;
      });
    } catch (error) {
      console.error('Error fetching assignments:', error);
      throw new Error('Failed to fetch assignments');
    }
  },

  // Get assignments for a specific group
  async getByGroup(groupId: string): Promise<CoachAssignment[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), where('groupId', '==', groupId));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          coachId: data.coachId,
          groupId: data.groupId,
          assignedAt: convertTimestamp(data.assignedAt),
        } as CoachAssignment;
      });
    } catch (error) {
      console.error('Error fetching group assignments:', error);
      throw new Error('Failed to fetch group assignments');
    }
  },

  // Get assignments for a specific coach
  async getByCoach(coachId: string): Promise<CoachAssignment[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), where('coachId', '==', coachId));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          coachId: data.coachId,
          groupId: data.groupId,
          assignedAt: convertTimestamp(data.assignedAt),
        } as CoachAssignment;
      });
    } catch (error) {
      console.error('Error fetching coach assignments:', error);
      throw new Error('Failed to fetch coach assignments');
    }
  },

  // Create new assignment
  async create(assignmentData: CreateAssignmentData): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...assignmentData,
        assignedAt: convertToTimestamp(new Date()),
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating assignment:', error);
      throw new Error('Failed to create assignment');
    }
  },

  // Delete assignment
  async delete(id: string): Promise<void> {
    try {
      const assignmentRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(assignmentRef);
    } catch (error) {
      console.error('Error deleting assignment:', error);
      throw new Error('Failed to delete assignment');
    }
  },

  // Delete all assignments for a group (when group is deleted)
  async deleteByGroup(groupId: string): Promise<void> {
    try {
      const assignments = await this.getByGroup(groupId);
      const deletePromises = assignments.map(assignment => this.delete(assignment.id));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting group assignments:', error);
      throw new Error('Failed to delete group assignments');
    }
  },

  // Delete all assignments for a coach (when coach is deleted)
  async deleteByCoach(coachId: string): Promise<void> {
    try {
      const assignments = await this.getByCoach(coachId);
      const deletePromises = assignments.map(assignment => this.delete(assignment.id));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting coach assignments:', error);
      throw new Error('Failed to delete coach assignments');
    }
  },

  // Assign multiple coaches to a group
  async assignCoachesToGroup(groupId: string, coachIds: string[]): Promise<void> {
    try {
      const createPromises = coachIds.map(coachId => 
        this.create({ coachId, groupId })
      );
      await Promise.all(createPromises);
    } catch (error) {
      console.error('Error assigning coaches to group:', error);
      throw new Error('Failed to assign coaches to group');
    }
  },

  // Remove all coaches from a group and assign new ones
  async updateGroupAssignments(groupId: string, coachIds: string[]): Promise<void> {
    try {
      // First, remove all existing assignments for this group
      await this.deleteByGroup(groupId);
      
      // Then, add new assignments
      if (coachIds.length > 0) {
        await this.assignCoachesToGroup(groupId, coachIds);
      }
    } catch (error) {
      console.error('Error updating group assignments:', error);
      throw new Error('Failed to update group assignments');
    }
  },
}; 