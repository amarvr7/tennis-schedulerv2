import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { 
  LocationGroup, 
  CreateLocationGroupData, 
  UpdateLocationGroupData,
  LocationGroupAssignment,
  CreateLocationGroupAssignmentData 
} from '../../types';

const GROUPS_COLLECTION = 'location_groups';
const ASSIGNMENTS_COLLECTION = 'location_group_assignments';

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

export const locationGroupService = {
  // Get all location groups
  async getAll(): Promise<LocationGroup[]> {
    try {
      const q = query(collection(db, GROUPS_COLLECTION), orderBy('name'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          description: data.description,
          color: data.color,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        } as LocationGroup;
      });
    } catch (error) {
      console.error('Error fetching location groups:', error);
      throw new Error('Failed to fetch location groups');
    }
  },

  // Create new location group
  async create(groupData: CreateLocationGroupData): Promise<string> {
    try {
      const now = new Date();
      const docRef = await addDoc(collection(db, GROUPS_COLLECTION), {
        ...groupData,
        createdAt: convertToTimestamp(now),
        updatedAt: convertToTimestamp(now),
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating location group:', error);
      throw new Error('Failed to create location group');
    }
  },

  // Update location group
  async update(updateData: UpdateLocationGroupData): Promise<void> {
    try {
      const { id, ...data } = updateData;
      const groupRef = doc(db, GROUPS_COLLECTION, id);
      
      await updateDoc(groupRef, {
        ...data,
        updatedAt: convertToTimestamp(new Date()),
      });
    } catch (error) {
      console.error('Error updating location group:', error);
      throw new Error('Failed to update location group');
    }
  },

  // Delete location group (and all its assignments)
  async delete(id: string): Promise<void> {
    try {
      // Delete all assignments for this group first
      await this.deleteAssignmentsByGroup(id);
      
      // Then delete the group
      const groupRef = doc(db, GROUPS_COLLECTION, id);
      await deleteDoc(groupRef);
    } catch (error) {
      console.error('Error deleting location group:', error);
      throw new Error('Failed to delete location group');
    }
  },

  // Get all assignments
  async getAllAssignments(): Promise<LocationGroupAssignment[]> {
    try {
      const querySnapshot = await getDocs(collection(db, ASSIGNMENTS_COLLECTION));
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          groupId: data.groupId,
          locationId: data.locationId,
          createdAt: convertTimestamp(data.createdAt),
        } as LocationGroupAssignment;
      });
    } catch (error) {
      console.error('Error fetching location group assignments:', error);
      throw new Error('Failed to fetch location group assignments');
    }
  },

  // Get assignments for a specific group
  async getAssignmentsByGroup(groupId: string): Promise<LocationGroupAssignment[]> {
    try {
      const q = query(
        collection(db, ASSIGNMENTS_COLLECTION),
        where('groupId', '==', groupId)
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          groupId: data.groupId,
          locationId: data.locationId,
          createdAt: convertTimestamp(data.createdAt),
        } as LocationGroupAssignment;
      });
    } catch (error) {
      console.error('Error fetching group assignments:', error);
      throw new Error('Failed to fetch group assignments');
    }
  },

  // Get assignments for a specific location
  async getAssignmentsByLocation(locationId: string): Promise<LocationGroupAssignment[]> {
    try {
      const q = query(
        collection(db, ASSIGNMENTS_COLLECTION),
        where('locationId', '==', locationId)
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          groupId: data.groupId,
          locationId: data.locationId,
          createdAt: convertTimestamp(data.createdAt),
        } as LocationGroupAssignment;
      });
    } catch (error) {
      console.error('Error fetching location assignments:', error);
      throw new Error('Failed to fetch location assignments');
    }
  },

  // Create assignment (add location to group)
  async createAssignment(assignmentData: CreateLocationGroupAssignmentData): Promise<string> {
    try {
      // Check if assignment already exists
      const existing = await this.getAssignmentsByGroup(assignmentData.groupId);
      const alreadyExists = existing.some(a => a.locationId === assignmentData.locationId);
      
      if (alreadyExists) {
        throw new Error('Location is already in this group');
      }

      const docRef = await addDoc(collection(db, ASSIGNMENTS_COLLECTION), {
        ...assignmentData,
        createdAt: convertToTimestamp(new Date()),
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating assignment:', error);
      throw new Error('Failed to create assignment');
    }
  },

  // Delete assignment (remove location from group)
  async deleteAssignment(assignmentId: string): Promise<void> {
    try {
      const assignmentRef = doc(db, ASSIGNMENTS_COLLECTION, assignmentId);
      await deleteDoc(assignmentRef);
    } catch (error) {
      console.error('Error deleting assignment:', error);
      throw new Error('Failed to delete assignment');
    }
  },

  // Delete all assignments for a group
  async deleteAssignmentsByGroup(groupId: string): Promise<void> {
    try {
      const assignments = await this.getAssignmentsByGroup(groupId);
      const deletePromises = assignments.map(assignment => this.deleteAssignment(assignment.id));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting group assignments:', error);
      throw new Error('Failed to delete group assignments');
    }
  },

  // Delete all assignments for a location
  async deleteAssignmentsByLocation(locationId: string): Promise<void> {
    try {
      const assignments = await this.getAssignmentsByLocation(locationId);
      const deletePromises = assignments.map(assignment => this.deleteAssignment(assignment.id));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting location assignments:', error);
      throw new Error('Failed to delete location assignments');
    }
  },

  // Update location assignments for a group (replace all)
  async updateGroupAssignments(groupId: string, locationIds: string[]): Promise<void> {
    try {
      // Remove all existing assignments for this group
      await this.deleteAssignmentsByGroup(groupId);
      
      // Add new assignments
      const createPromises = locationIds.map(locationId => 
        this.createAssignment({ groupId, locationId })
      );
      await Promise.all(createPromises);
    } catch (error) {
      console.error('Error updating group assignments:', error);
      throw new Error('Failed to update group assignments');
    }
  },
}; 