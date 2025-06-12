import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  query, 
  where,
  or,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { LocationAdjacency, CreateAdjacencyData } from '../../types';

const COLLECTION_NAME = 'location_adjacencies';

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

export const adjacencyService = {
  // Get all adjacencies
  async getAll(): Promise<LocationAdjacency[]> {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          locationId1: data.locationId1,
          locationId2: data.locationId2,
          createdAt: convertTimestamp(data.createdAt),
        } as LocationAdjacency;
      });
    } catch (error) {
      console.error('Error fetching adjacencies:', error);
      throw new Error('Failed to fetch adjacencies');
    }
  },

  // Get adjacencies for a specific location (bidirectional)
  async getByLocation(locationId: string): Promise<LocationAdjacency[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME), 
        or(
          where('locationId1', '==', locationId),
          where('locationId2', '==', locationId)
        )
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          locationId1: data.locationId1,
          locationId2: data.locationId2,
          createdAt: convertTimestamp(data.createdAt),
        } as LocationAdjacency;
      });
    } catch (error) {
      console.error('Error fetching location adjacencies:', error);
      throw new Error('Failed to fetch location adjacencies');
    }
  },

  // Create new adjacency (bidirectional - only create one record)
  async create(adjacencyData: CreateAdjacencyData): Promise<string> {
    try {
      // Ensure consistent ordering to avoid duplicates
      const locationId1 = adjacencyData.locationId1 < adjacencyData.locationId2 
        ? adjacencyData.locationId1 
        : adjacencyData.locationId2;
      const locationId2 = adjacencyData.locationId1 < adjacencyData.locationId2 
        ? adjacencyData.locationId2 
        : adjacencyData.locationId1;

      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        locationId1,
        locationId2,
        createdAt: convertToTimestamp(new Date()),
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating adjacency:', error);
      throw new Error('Failed to create adjacency');
    }
  },

  // Delete adjacency
  async delete(id: string): Promise<void> {
    try {
      const adjacencyRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(adjacencyRef);
    } catch (error) {
      console.error('Error deleting adjacency:', error);
      throw new Error('Failed to delete adjacency');
    }
  },

  // Delete all adjacencies for a location (when location is deleted)
  async deleteByLocation(locationId: string): Promise<void> {
    try {
      const adjacencies = await this.getByLocation(locationId);
      const deletePromises = adjacencies.map(adjacency => this.delete(adjacency.id));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting location adjacencies:', error);
      throw new Error('Failed to delete location adjacencies');
    }
  },

  // Set adjacencies for a location (remove all existing, add new ones)
  async updateLocationAdjacencies(locationId: string, adjacentLocationIds: string[]): Promise<void> {
    try {
      // First, remove all existing adjacencies for this location
      await this.deleteByLocation(locationId);
      
      // Then, add new adjacencies
      const createPromises = adjacentLocationIds.map(adjacentId => 
        this.create({ locationId1: locationId, locationId2: adjacentId })
      );
      await Promise.all(createPromises);
    } catch (error) {
      console.error('Error updating location adjacencies:', error);
      throw new Error('Failed to update location adjacencies');
    }
  },

  // Check if two locations are adjacent
  async areAdjacent(locationId1: string, locationId2: string): Promise<boolean> {
    try {
      // Ensure consistent ordering
      const id1 = locationId1 < locationId2 ? locationId1 : locationId2;
      const id2 = locationId1 < locationId2 ? locationId2 : locationId1;

      const q = query(
        collection(db, COLLECTION_NAME),
        where('locationId1', '==', id1),
        where('locationId2', '==', id2)
      );
      const querySnapshot = await getDocs(q);
      
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking adjacency:', error);
      return false;
    }
  },
}; 