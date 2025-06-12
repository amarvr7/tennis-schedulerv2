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
import { Group, CreateGroupData, UpdateGroupData } from '../../types';

const COLLECTION_NAME = 'groups';

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

export const groupService = {
  // Get all groups
  async getAll(): Promise<Group[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('name'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          size: data.size || 8, // Default to 8 if not set (for existing data)
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        } as Group;
      });
    } catch (error) {
      console.error('Error fetching groups:', error);
      throw new Error('Failed to fetch groups');
    }
  },

  // Add a new group
  async create(groupData: CreateGroupData): Promise<string> {
    try {
      const now = new Date();
      const { coachIds, ...groupFields } = groupData;
      
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...groupFields,
        createdAt: convertToTimestamp(now),
        updatedAt: convertToTimestamp(now),
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating group:', error);
      throw new Error('Failed to create group');
    }
  },

  // Update an existing group
  async update(updateData: UpdateGroupData): Promise<void> {
    try {
      const { id, coachIds, ...data } = updateData;
      const groupRef = doc(db, COLLECTION_NAME, id);
      
      await updateDoc(groupRef, {
        ...data,
        updatedAt: convertToTimestamp(new Date()),
      });
    } catch (error) {
      console.error('Error updating group:', error);
      throw new Error('Failed to update group');
    }
  },

  // Delete a group
  async delete(id: string): Promise<void> {
    try {
      const groupRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(groupRef);
    } catch (error) {
      console.error('Error deleting group:', error);
      throw new Error('Failed to delete group');
    }
  },
}; 