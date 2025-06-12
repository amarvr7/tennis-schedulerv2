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
import { Location, CreateLocationData, UpdateLocationData } from '../../types';

const COLLECTION_NAME = 'locations';

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

export const locationService = {
  // Get all locations
  async getAll(): Promise<Location[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('name'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          surfaceType: data.surfaceType,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        } as Location;
      });
    } catch (error) {
      console.error('Error fetching locations:', error);
      throw new Error('Failed to fetch locations');
    }
  },

  // Add a new location
  async create(locationData: CreateLocationData): Promise<string> {
    try {
      const now = new Date();
      const { adjacentLocationIds, ...locationFields } = locationData;
      
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...locationFields,
        createdAt: convertToTimestamp(now),
        updatedAt: convertToTimestamp(now),
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating location:', error);
      throw new Error('Failed to create location');
    }
  },

  // Update an existing location
  async update(updateData: UpdateLocationData): Promise<void> {
    try {
      const { id, adjacentLocationIds, ...data } = updateData;
      const locationRef = doc(db, COLLECTION_NAME, id);
      
      await updateDoc(locationRef, {
        ...data,
        updatedAt: convertToTimestamp(new Date()),
      });
    } catch (error) {
      console.error('Error updating location:', error);
      throw new Error('Failed to update location');
    }
  },

  // Delete a location
  async delete(id: string): Promise<void> {
    try {
      const locationRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(locationRef);
    } catch (error) {
      console.error('Error deleting location:', error);
      throw new Error('Failed to delete location');
    }
  },
}; 