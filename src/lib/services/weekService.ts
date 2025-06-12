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
import { Week, CreateWeekData, UpdateWeekData } from '../../types';

const COLLECTION_NAME = 'weeks';

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

export const weekService = {
  // Get all weeks
  async getAll(): Promise<Week[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('startDate', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          startDate: convertTimestamp(data.startDate),
          endDate: convertTimestamp(data.endDate),
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        } as Week;
      });
    } catch (error) {
      console.error('Error fetching weeks:', error);
      throw new Error('Failed to fetch weeks');
    }
  },

  // Add a new week
  async create(weekData: CreateWeekData): Promise<string> {
    try {
      const now = new Date();
      
      // Ensure dates are treated as local dates, not UTC
      const startDate = new Date(weekData.startDate.getFullYear(), weekData.startDate.getMonth(), weekData.startDate.getDate());
      const endDate = new Date(weekData.endDate.getFullYear(), weekData.endDate.getMonth(), weekData.endDate.getDate());
      
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        name: weekData.name,
        startDate: convertToTimestamp(startDate),
        endDate: convertToTimestamp(endDate),
        createdAt: convertToTimestamp(now),
        updatedAt: convertToTimestamp(now),
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating week:', error);
      throw new Error('Failed to create week');
    }
  },

  // Update an existing week
  async update(updateData: UpdateWeekData): Promise<void> {
    try {
      const { id, ...data } = updateData;
      const weekRef = doc(db, COLLECTION_NAME, id);
      
      const updatePayload: any = {
        updatedAt: convertToTimestamp(new Date()),
      };

      // Only add fields that have defined values
      if (data.name !== undefined) {
        updatePayload.name = data.name;
      }
      if (data.startDate !== undefined) {
        // Ensure dates are treated as local dates, not UTC
        const startDate = new Date(data.startDate.getFullYear(), data.startDate.getMonth(), data.startDate.getDate());
        updatePayload.startDate = convertToTimestamp(startDate);
      }
      if (data.endDate !== undefined) {
        // Ensure dates are treated as local dates, not UTC
        const endDate = new Date(data.endDate.getFullYear(), data.endDate.getMonth(), data.endDate.getDate());
        updatePayload.endDate = convertToTimestamp(endDate);
      }
      
      await updateDoc(weekRef, updatePayload);
    } catch (error) {
      console.error('Error updating week:', error);
      throw new Error('Failed to update week');
    }
  },

  // Delete a week
  async delete(id: string): Promise<void> {
    try {
      const weekRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(weekRef);
    } catch (error) {
      console.error('Error deleting week:', error);
      throw new Error('Failed to delete week');
    }
  },
}; 