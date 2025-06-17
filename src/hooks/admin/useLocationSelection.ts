import { useState } from 'react';
import { Location } from '@/types';

export function useLocationSelection(locations: Location[]) {
  const [selectedLocations, setSelectedLocations] = useState<Set<string>>(new Set());

  const handleLocationToggle = (locationId: string) => {
    const newSelected = new Set(selectedLocations);
    if (newSelected.has(locationId)) {
      newSelected.delete(locationId);
    } else {
      newSelected.add(locationId);
    }
    setSelectedLocations(newSelected);
  };

  const selectAll = () => {
    const allLocationIds = new Set(locations.map(location => location.id));
    setSelectedLocations(allLocationIds);
  };

  const unselectAll = () => {
    setSelectedLocations(new Set());
  };

  // Initialize with all locations selected
  const initializeSelection = () => {
    if (locations.length > 0 && selectedLocations.size === 0) {
      selectAll();
    }
  };

  return {
    selectedLocations,
    handleLocationToggle,
    selectAll,
    unselectAll,
    initializeSelection,
  };
} 