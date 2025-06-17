import { useState } from 'react';
import { CoachWithGroups } from '@/types';

export function useCoachSelection(coaches: CoachWithGroups[]) {
  const [selectedCoaches, setSelectedCoaches] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const handleCoachToggle = (coachId: string) => {
    const newSelected = new Set(selectedCoaches);
    if (newSelected.has(coachId)) {
      newSelected.delete(coachId);
    } else {
      newSelected.add(coachId);
    }
    setSelectedCoaches(newSelected);
  };

  const selectAll = () => {
    const allCoachIds = new Set(coaches.map(coach => coach.id));
    setSelectedCoaches(allCoachIds);
  };

  const unselectAll = () => {
    setSelectedCoaches(new Set());
  };

  // Initialize with all coaches selected
  const initializeSelection = () => {
    if (coaches.length > 0 && selectedCoaches.size === 0) {
      selectAll();
    }
  };

  return {
    selectedCoaches,
    saving,
    setSaving,
    handleCoachToggle,
    selectAll,
    unselectAll,
    initializeSelection,
  };
} 