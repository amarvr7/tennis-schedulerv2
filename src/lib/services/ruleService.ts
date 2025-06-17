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
import { Rule, CreateRuleData, UpdateRuleData } from '../../types';

const COLLECTION_NAME = 'rules';

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

export const ruleService = {
  // Get all rules
  async getAll(): Promise<Rule[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('priority', 'asc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          content: data.content,
          priority: data.priority,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        } as Rule;
      });
    } catch (error) {
      console.error('Error fetching rules:', error);
      throw new Error('Failed to fetch rules');
    }
  },

  // Add a new rule
  async create(ruleData: CreateRuleData): Promise<string> {
    try {
      const now = new Date();
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...ruleData,
        createdAt: convertToTimestamp(now),
        updatedAt: convertToTimestamp(now),
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating rule:', error);
      throw new Error('Failed to create rule');
    }
  },

  // Update an existing rule
  async update(updateData: UpdateRuleData): Promise<void> {
    try {
      const { id, ...data } = updateData;
      const ruleRef = doc(db, COLLECTION_NAME, id);
      
      await updateDoc(ruleRef, {
        ...data,
        updatedAt: convertToTimestamp(new Date()),
      });
    } catch (error) {
      console.error('Error updating rule:', error);
      throw new Error('Failed to update rule');
    }
  },

  // Delete a rule
  async delete(id: string): Promise<void> {
    try {
      const ruleRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(ruleRef);
    } catch (error) {
      console.error('Error deleting rule:', error);
      throw new Error('Failed to delete rule');
    }
  },

  // Reorder rules (update priorities)
  async reorder(rules: Rule[]): Promise<void> {
    try {
      const batch = [];
      for (let i = 0; i < rules.length; i++) {
        const ruleRef = doc(db, COLLECTION_NAME, rules[i].id);
        batch.push(
          updateDoc(ruleRef, {
            priority: i + 1, // 1-based priority
            updatedAt: convertToTimestamp(new Date()),
          })
        );
      }
      await Promise.all(batch);
    } catch (error) {
      console.error('Error reordering rules:', error);
      throw new Error('Failed to reorder rules');
    }
  },
}; 