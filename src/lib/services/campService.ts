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
import { Camp, CreateCampData, UpdateCampData } from '../../types';

const COLLECTION_NAME = 'camps';

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

export const campService = {
  // Get all camps
  async getAll(): Promise<Camp[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          weekId: data.weekId,
          juniorPlayers: data.juniorPlayers,
          adultPlayers: data.adultPlayers || {},
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        } as Camp;
      });
    } catch (error) {
      console.error('Error fetching camps:', error);
      throw new Error('Failed to fetch camps');
    }
  },

  // Add a new camp
  async create(campData: CreateCampData): Promise<string> {
    try {
      const now = new Date();
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        weekId: campData.weekId,
        juniorPlayers: campData.juniorPlayers,
        adultPlayers: campData.adultPlayers,
        createdAt: convertToTimestamp(now),
        updatedAt: convertToTimestamp(now),
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating camp:', error);
      throw new Error('Failed to create camp');
    }
  },

  // Update an existing camp
  async update(updateData: UpdateCampData): Promise<void> {
    try {
      const { id, ...data } = updateData;
      const campRef = doc(db, COLLECTION_NAME, id);
      
      const updatePayload: any = {
        updatedAt: convertToTimestamp(new Date()),
      };

      // Only add fields that have defined values
      if (data.weekId !== undefined) {
        updatePayload.weekId = data.weekId;
      }
      if (data.juniorPlayers !== undefined) {
        updatePayload.juniorPlayers = data.juniorPlayers;
      }
      if (data.adultPlayers !== undefined) {
        updatePayload.adultPlayers = data.adultPlayers;
      }
      
      await updateDoc(campRef, updatePayload);
    } catch (error) {
      console.error('Error updating camp:', error);
      throw new Error('Failed to update camp');
    }
  },

  // Delete a camp
  async delete(id: string): Promise<void> {
    try {
      const campRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(campRef);
    } catch (error) {
      console.error('Error deleting camp:', error);
      throw new Error('Failed to delete camp');
    }
  },

  // Get camp by week
  async getByWeek(weekId: string): Promise<Camp | null> {
    try {
      const q = query(collection(db, COLLECTION_NAME), where('weekId', '==', weekId));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        weekId: data.weekId,
        juniorPlayers: data.juniorPlayers,
        adultPlayers: data.adultPlayers || {},
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
      } as Camp;
    } catch (error) {
      console.error('Error fetching camp by week:', error);
      throw new Error('Failed to fetch camp by week');
    }
  },
}; 