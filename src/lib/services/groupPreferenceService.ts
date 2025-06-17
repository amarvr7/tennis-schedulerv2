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
import { GroupPreference, CreateGroupPreferenceData, UpdateGroupPreferenceData } from '../../types';

const COLLECTION_NAME = 'groupPreferences';

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

export const groupPreferenceService = {
  // Get all group preferences
  async getAll(): Promise<GroupPreference[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          groupId: data.groupId,
          weekId: data.weekId,
          preferenceType: data.preferenceType,
          locationIds: data.locationIds || (data.locationId ? [data.locationId] : undefined), // Handle legacy data
          surfaceType: data.surfaceType,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        } as GroupPreference;
      });
    } catch (error) {
      console.error('Error fetching group preferences:', error);
      throw new Error('Failed to fetch group preferences');
    }
  },

  // Get preferences by group
  async getByGroup(groupId: string): Promise<GroupPreference[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME), 
        where('groupId', '==', groupId)
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          groupId: data.groupId,
          weekId: data.weekId,
          preferenceType: data.preferenceType,
          locationIds: data.locationIds || (data.locationId ? [data.locationId] : undefined), // Handle legacy data
          surfaceType: data.surfaceType,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        } as GroupPreference;
      });
    } catch (error) {
      console.error('Error fetching group preferences by group:', error);
      throw new Error('Failed to fetch group preferences by group');
    }
  },

  // Get preferences by week
  async getByWeek(weekId: string): Promise<GroupPreference[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME), 
        where('weekId', '==', weekId)
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          groupId: data.groupId,
          weekId: data.weekId,
          preferenceType: data.preferenceType,
          locationIds: data.locationIds || (data.locationId ? [data.locationId] : undefined), // Handle legacy data
          surfaceType: data.surfaceType,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        } as GroupPreference;
      });
    } catch (error) {
      console.error('Error fetching group preferences by week:', error);
      throw new Error('Failed to fetch group preferences by week');
    }
  },

  // Check if group already has preference for a week
  async hasPreferenceForWeek(groupId: string, weekId: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('groupId', '==', groupId),
        where('weekId', '==', weekId)
      );
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking existing preference:', error);
      return false;
    }
  },

  // Add a new group preference
  async create(preferenceData: CreateGroupPreferenceData): Promise<string> {
    try {
      // Check if group already has a preference for this week
      const hasExisting = await this.hasPreferenceForWeek(preferenceData.groupId, preferenceData.weekId);
      if (hasExisting) {
        throw new Error('Group already has a preference for this week');
      }

      const now = new Date();
      
      // Clean data to remove undefined values (Firebase doesn't accept undefined)
      const cleanData: any = {
        groupId: preferenceData.groupId,
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
      console.error('Error creating group preference:', error);
      throw error;
    }
  },

  // Update an existing group preference
  async update(updateData: UpdateGroupPreferenceData): Promise<void> {
    try {
      const { id, ...data } = updateData;
      const preferenceRef = doc(db, COLLECTION_NAME, id);
      
      // Clean data to remove undefined values (Firebase doesn't accept undefined)
      const cleanData: any = {
        updatedAt: convertToTimestamp(new Date()),
      };

      // Only add fields that are not undefined
      if (data.groupId) cleanData.groupId = data.groupId;
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
      console.error('Error updating group preference:', error);
      throw new Error('Failed to update group preference');
    }
  },

  // Delete a group preference
  async delete(id: string): Promise<void> {
    try {
      const preferenceRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(preferenceRef);
    } catch (error) {
      console.error('Error deleting group preference:', error);
      throw new Error('Failed to delete group preference');
    }
  },

  // Delete all preferences for a specific group
  async deleteByGroup(groupId: string): Promise<void> {
    try {
      const q = query(collection(db, COLLECTION_NAME), where('groupId', '==', groupId));
      const querySnapshot = await getDocs(q);
      
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting group preferences by group:', error);
      throw new Error('Failed to delete group preferences by group');
    }
  },

  // Delete all preferences for a specific week
  async deleteByWeek(weekId: string): Promise<void> {
    try {
      const q = query(collection(db, COLLECTION_NAME), where('weekId', '==', weekId));
      const querySnapshot = await getDocs(q);
      
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting group preferences by week:', error);
      throw new Error('Failed to delete group preferences by week');
    }
  }
}; 