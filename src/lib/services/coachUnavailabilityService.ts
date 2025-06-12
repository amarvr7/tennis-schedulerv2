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
import { CoachUnavailability, CreateCoachUnavailabilityData, UpdateCoachUnavailabilityData } from '../../types';

const COLLECTION_NAME = 'coachUnavailability';

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

export const coachUnavailabilityService = {
  // Get all coach unavailability records
  async getAll(): Promise<CoachUnavailability[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('startDate', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          coachId: data.coachId,
          startDate: convertTimestamp(data.startDate),
          endDate: convertTimestamp(data.endDate),
          startTime: data.startTime,
          endTime: data.endTime,
          isAllDay: data.isAllDay,
          reason: data.reason,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        } as CoachUnavailability;
      });
    } catch (error) {
      console.error('Error fetching coach unavailability:', error);
      throw new Error('Failed to fetch coach unavailability');
    }
  },

  // Add a new coach unavailability record
  async create(unavailabilityData: CreateCoachUnavailabilityData): Promise<string> {
    try {
      const now = new Date();
      
      // Filter out undefined values
      const cleanData: any = {
        coachId: unavailabilityData.coachId,
        startDate: convertToTimestamp(unavailabilityData.startDate),
        endDate: convertToTimestamp(unavailabilityData.endDate),
        isAllDay: unavailabilityData.isAllDay,
        createdAt: convertToTimestamp(now),
        updatedAt: convertToTimestamp(now),
      };

      // Only add optional fields if they have values
      if (unavailabilityData.startTime !== undefined) {
        cleanData.startTime = unavailabilityData.startTime;
      }
      if (unavailabilityData.endTime !== undefined) {
        cleanData.endTime = unavailabilityData.endTime;
      }
      if (unavailabilityData.reason !== undefined && unavailabilityData.reason.trim() !== '') {
        cleanData.reason = unavailabilityData.reason;
      }

      const docRef = await addDoc(collection(db, COLLECTION_NAME), cleanData);
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating coach unavailability:', error);
      throw new Error('Failed to create coach unavailability');
    }
  },

  // Update an existing coach unavailability record
  async update(updateData: UpdateCoachUnavailabilityData): Promise<void> {
    try {
      const { id, ...data } = updateData;
      const unavailabilityRef = doc(db, COLLECTION_NAME, id);
      
      const updatePayload: any = {
        updatedAt: convertToTimestamp(new Date()),
      };

      // Only add fields that have defined values
      if (data.coachId !== undefined) {
        updatePayload.coachId = data.coachId;
      }
      if (data.startDate !== undefined) {
        updatePayload.startDate = convertToTimestamp(data.startDate);
      }
      if (data.endDate !== undefined) {
        updatePayload.endDate = convertToTimestamp(data.endDate);
      }
      if (data.isAllDay !== undefined) {
        updatePayload.isAllDay = data.isAllDay;
      }
      if (data.startTime !== undefined) {
        updatePayload.startTime = data.startTime;
      }
      if (data.endTime !== undefined) {
        updatePayload.endTime = data.endTime;
      }
      if (data.reason !== undefined) {
        if (data.reason.trim() === '') {
          // Remove the field if reason is empty
          updatePayload.reason = null;
        } else {
          updatePayload.reason = data.reason;
        }
      }
      
      await updateDoc(unavailabilityRef, updatePayload);
    } catch (error) {
      console.error('Error updating coach unavailability:', error);
      throw new Error('Failed to update coach unavailability');
    }
  },

  // Delete a coach unavailability record
  async delete(id: string): Promise<void> {
    try {
      const unavailabilityRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(unavailabilityRef);
    } catch (error) {
      console.error('Error deleting coach unavailability:', error);
      throw new Error('Failed to delete coach unavailability');
    }
  },

  // Get unavailability records by coach
  async getByCoach(coachId: string): Promise<CoachUnavailability[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME), 
        where('coachId', '==', coachId),
        orderBy('startDate', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          coachId: data.coachId,
          startDate: convertTimestamp(data.startDate),
          endDate: convertTimestamp(data.endDate),
          startTime: data.startTime,
          endTime: data.endTime,
          isAllDay: data.isAllDay,
          reason: data.reason,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        } as CoachUnavailability;
      });
    } catch (error) {
      console.error('Error fetching coach unavailability by coach:', error);
      throw new Error('Failed to fetch coach unavailability by coach');
    }
  },
}; 