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
import { CoachPreference, CreateCoachPreferenceData, UpdateCoachPreferenceData } from '../../types';

const COLLECTION_NAME = 'coachPreferences';

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

export const coachPreferenceService = {
  // Get all coach preferences
  async getAll(): Promise<CoachPreference[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          coachId: data.coachId,
          weekId: data.weekId,
          preferenceType: data.preferenceType,
          locationIds: data.locationIds || (data.locationId ? [data.locationId] : undefined), // Handle legacy data
          surfaceType: data.surfaceType,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        } as CoachPreference;
      });
    } catch (error) {
      console.error('Error fetching coach preferences:', error);
      throw new Error('Failed to fetch coach preferences');
    }
  },

  // Get preferences by coach
  async getByCoach(coachId: string): Promise<CoachPreference[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME), 
        where('coachId', '==', coachId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          coachId: data.coachId,
          weekId: data.weekId,
          preferenceType: data.preferenceType,
          locationIds: data.locationIds || (data.locationId ? [data.locationId] : undefined), // Handle legacy data
          surfaceType: data.surfaceType,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        } as CoachPreference;
      });
    } catch (error) {
      console.error('Error fetching coach preferences by coach:', error);
      throw new Error('Failed to fetch coach preferences by coach');
    }
  },

  // Get preferences by week
  async getByWeek(weekId: string): Promise<CoachPreference[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME), 
        where('weekId', '==', weekId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          coachId: data.coachId,
          weekId: data.weekId,
          preferenceType: data.preferenceType,
          locationIds: data.locationIds || (data.locationId ? [data.locationId] : undefined), // Handle legacy data
          surfaceType: data.surfaceType,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        } as CoachPreference;
      });
    } catch (error) {
      console.error('Error fetching coach preferences by week:', error);
      throw new Error('Failed to fetch coach preferences by week');
    }
  },

  // Check if coach already has preference for a week
  async hasPreferenceForWeek(coachId: string, weekId: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('coachId', '==', coachId),
        where('weekId', '==', weekId)
      );
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking existing preference:', error);
      return false;
    }
  },

  // Add a new coach preference
  async create(preferenceData: CreateCoachPreferenceData): Promise<string> {
    try {
      // Check if coach already has a preference for this week
      const hasExisting = await this.hasPreferenceForWeek(preferenceData.coachId, preferenceData.weekId);
      if (hasExisting) {
        throw new Error('Coach already has a preference for this week');
      }

      const now = new Date();
      
      // Clean data to remove undefined values (Firebase doesn't accept undefined)
      const cleanData: any = {
        coachId: preferenceData.coachId,
        weekId: preferenceData.weekId,
        preferenceType: preferenceData.preferenceType,
        createdAt: convertToTimestamp(now),
        updatedAt: convertToTimestamp(now),
      };

      // Only add fields that are not undefined
      if (preferenceData.locationIds && preferenceData.locationIds.length > 0) {
        cleanData.locationIds = preferenceData.locationIds;
      }
      if (preferenceData.surfaceType) {
        cleanData.surfaceType = preferenceData.surfaceType;
      }

      const docRef = await addDoc(collection(db, COLLECTION_NAME), cleanData);
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating coach preference:', error);
      throw error;
    }
  },

  // Update an existing coach preference
  async update(updateData: UpdateCoachPreferenceData): Promise<void> {
    try {
      const { id, ...data } = updateData;
      const preferenceRef = doc(db, COLLECTION_NAME, id);
      
      // Clean data to remove undefined values (Firebase doesn't accept undefined)
      const cleanData: any = {
        updatedAt: convertToTimestamp(new Date()),
      };

      // Only add fields that are not undefined
      if (data.coachId) cleanData.coachId = data.coachId;
      if (data.weekId) cleanData.weekId = data.weekId;
      if (data.preferenceType) cleanData.preferenceType = data.preferenceType;
      if (data.locationIds && data.locationIds.length > 0) {
        cleanData.locationIds = data.locationIds;
      }
      if (data.surfaceType) {
        cleanData.surfaceType = data.surfaceType;
      }

      await updateDoc(preferenceRef, cleanData);
    } catch (error) {
      console.error('Error updating coach preference:', error);
      throw new Error('Failed to update coach preference');
    }
  },

  // Delete a coach preference
  async delete(id: string): Promise<void> {
    try {
      const preferenceRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(preferenceRef);
    } catch (error) {
      console.error('Error deleting coach preference:', error);
      throw new Error('Failed to delete coach preference');
    }
  },

  // Delete all preferences for a coach
  async deleteByCoach(coachId: string): Promise<void> {
    try {
      const q = query(collection(db, COLLECTION_NAME), where('coachId', '==', coachId));
      const querySnapshot = await getDocs(q);
      
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting coach preferences by coach:', error);
      throw new Error('Failed to delete coach preferences by coach');
    }
  },

  // Delete all preferences for a week
  async deleteByWeek(weekId: string): Promise<void> {
    try {
      const q = query(collection(db, COLLECTION_NAME), where('weekId', '==', weekId));
      const querySnapshot = await getDocs(q);
      
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting coach preferences by week:', error);
      throw new Error('Failed to delete coach preferences by week');
    }
  },
}; 