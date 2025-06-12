import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { Coach, CreateCoachData, UpdateCoachData } from '../../types';

const COLLECTION_NAME = 'coaches';

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

export const coachService = {
  // Get all coaches
  async getAll(): Promise<Coach[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('name'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          role: data.role,
          email: data.email,
          phone: data.phone,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        } as Coach;
      });
    } catch (error) {
      console.error('Error fetching coaches:', error);
      throw new Error('Failed to fetch coaches');
    }
  },

  // Add a new coach
  async create(coachData: CreateCoachData): Promise<string> {
    try {
      const now = new Date();
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...coachData,
        createdAt: convertToTimestamp(now),
        updatedAt: convertToTimestamp(now),
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating coach:', error);
      throw new Error('Failed to create coach');
    }
  },

  // Update an existing coach
  async update(updateData: UpdateCoachData): Promise<void> {
    try {
      const { id, ...data } = updateData;
      const coachRef = doc(db, COLLECTION_NAME, id);
      
      await updateDoc(coachRef, {
        ...data,
        updatedAt: convertToTimestamp(new Date()),
      });
    } catch (error) {
      console.error('Error updating coach:', error);
      throw new Error('Failed to update coach');
    }
  },

  // Delete a coach
  async delete(id: string): Promise<void> {
    try {
      const coachRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(coachRef);
    } catch (error) {
      console.error('Error deleting coach:', error);
      throw new Error('Failed to delete coach');
    }
  },
}; 