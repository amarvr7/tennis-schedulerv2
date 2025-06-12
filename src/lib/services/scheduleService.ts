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
import { ScheduleSlot, CreateScheduleSlotData, UpdateScheduleSlotData } from '../../types';

const COLLECTION_NAME = 'scheduleSlots';

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

export const scheduleService = {
  // Get all schedule slots
  async getAll(): Promise<ScheduleSlot[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('day'), orderBy('timeSlot'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          day: data.day,
          timeSlot: data.timeSlot,
          isActive: data.isActive,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        } as ScheduleSlot;
      });
    } catch (error) {
      console.error('Error fetching schedule slots:', error);
      throw new Error('Failed to fetch schedule slots');
    }
  },

  // Add a new schedule slot
  async create(slotData: CreateScheduleSlotData): Promise<string> {
    try {
      const now = new Date();
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...slotData,
        createdAt: convertToTimestamp(now),
        updatedAt: convertToTimestamp(now),
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating schedule slot:', error);
      throw new Error('Failed to create schedule slot');
    }
  },

  // Update an existing schedule slot
  async update(updateData: UpdateScheduleSlotData): Promise<void> {
    try {
      const { id, ...data } = updateData;
      const slotRef = doc(db, COLLECTION_NAME, id);
      
      await updateDoc(slotRef, {
        ...data,
        updatedAt: convertToTimestamp(new Date()),
      });
    } catch (error) {
      console.error('Error updating schedule slot:', error);
      throw new Error('Failed to update schedule slot');
    }
  },

  // Delete a schedule slot
  async delete(id: string): Promise<void> {
    try {
      const slotRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(slotRef);
    } catch (error) {
      console.error('Error deleting schedule slot:', error);
      throw new Error('Failed to delete schedule slot');
    }
  },

  // Find existing slot by day and time
  async findByDayAndTime(day: string, timeSlot: string): Promise<ScheduleSlot | null> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME), 
        where('day', '==', day),
        where('timeSlot', '==', timeSlot)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        day: data.day,
        timeSlot: data.timeSlot,
        isActive: data.isActive,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
      } as ScheduleSlot;
    } catch (error) {
      console.error('Error finding schedule slot:', error);
      throw new Error('Failed to find schedule slot');
    }
  },
}; 