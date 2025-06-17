import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc,
  deleteDoc, 
  query, 
  where,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { GroupScheduleSlot, CreateGroupScheduleSlotData, UpdateGroupScheduleSlotData } from '../../types';

const COLLECTION_NAME = 'group_schedule_slots';

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

export const groupScheduleService = {
  // Get all group schedule slots
  async getAll(): Promise<GroupScheduleSlot[]> {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          groupId: data.groupId,
          day: data.day,
          startTime: data.startTime,
          endTime: data.endTime,
          locationId: data.locationId,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        } as GroupScheduleSlot;
      });
    } catch (error) {
      console.error('Error fetching group schedule slots:', error);
      throw new Error('Failed to fetch group schedule slots');
    }
  },

  // Get schedule slots for a specific group
  async getByGroup(groupId: string): Promise<GroupScheduleSlot[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), where('groupId', '==', groupId));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          groupId: data.groupId,
          day: data.day,
          startTime: data.startTime,
          endTime: data.endTime,
          locationId: data.locationId,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        } as GroupScheduleSlot;
      });
    } catch (error) {
      console.error('Error fetching group schedule slots:', error);
      throw new Error('Failed to fetch group schedule slots');
    }
  },

  // Get schedule slots for a specific day
  async getByDay(day: string): Promise<GroupScheduleSlot[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), where('day', '==', day));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          groupId: data.groupId,
          day: data.day,
          startTime: data.startTime,
          endTime: data.endTime,
          locationId: data.locationId,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        } as GroupScheduleSlot;
      });
    } catch (error) {
      console.error('Error fetching schedule slots by day:', error);
      throw new Error('Failed to fetch schedule slots by day');
    }
  },

  // Create new group schedule slot
  async create(slotData: CreateGroupScheduleSlotData): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...slotData,
        createdAt: convertToTimestamp(new Date()),
        updatedAt: convertToTimestamp(new Date()),
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating group schedule slot:', error);
      throw new Error('Failed to create group schedule slot');
    }
  },

  // Update group schedule slot
  async update(updateData: UpdateGroupScheduleSlotData): Promise<void> {
    try {
      const { id, ...data } = updateData;
      const slotRef = doc(db, COLLECTION_NAME, id);
      
      await updateDoc(slotRef, {
        ...data,
        updatedAt: convertToTimestamp(new Date()),
      });
    } catch (error) {
      console.error('Error updating group schedule slot:', error);
      throw new Error('Failed to update group schedule slot');
    }
  },

  // Delete group schedule slot
  async delete(id: string): Promise<void> {
    try {
      const slotRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(slotRef);
    } catch (error) {
      console.error('Error deleting group schedule slot:', error);
      throw new Error('Failed to delete group schedule slot');
    }
  },

  // Delete all schedule slots for a group
  async deleteByGroup(groupId: string): Promise<void> {
    try {
      const slots = await this.getByGroup(groupId);
      const deletePromises = slots.map(slot => this.delete(slot.id));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting group schedule slots:', error);
      throw new Error('Failed to delete group schedule slots');
    }
  },

  // Validation: Check for time overlaps at same location
  async checkOverlap(
    groupId: string, 
    day: string, 
    startTime: string, 
    endTime: string, 
    locationId?: string,
    excludeSlotId?: string
  ): Promise<boolean> {
    try {
      if (!locationId) return false; // No overlap check if no location specified
      
      const daySlots = await this.getByDay(day);
      
      // Filter by location and exclude current slot if updating
      const locationSlots = daySlots.filter(slot => 
        slot.locationId === locationId && 
        slot.id !== excludeSlotId
      );

      // Check for time overlap
      const newStart = timeToMinutes(startTime);
      const newEnd = timeToMinutes(endTime);

      return locationSlots.some(slot => {
        const existingStart = timeToMinutes(slot.startTime);
        const existingEnd = timeToMinutes(slot.endTime);
        
        // Check if times overlap
        return newStart < existingEnd && newEnd > existingStart;
      });
    } catch (error) {
      console.error('Error checking overlap:', error);
      return false; // Don't block on error
    }
  },
};

// Helper function to convert time string to minutes for comparison
function timeToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
} 