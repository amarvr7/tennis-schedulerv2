import { useState, useMemo } from 'react';
import Button from './Button';
import Input from './Input';
import Select from './Select';
import Checkbox from './Checkbox';
import Typography from './Typography';
import { CreateLocationData, Location } from '../../types';

interface LocationFormProps {
  initialData?: Partial<CreateLocationData>;
  onSubmit: (data: CreateLocationData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  isEdit?: boolean;
  locations: Location[];
  initialAdjacentIds?: string[];
  currentLocationId?: string; // For edit mode - exclude current location from adjacency options
}

interface FormErrors {
  name?: string;
  surfaceType?: string;
}

const SURFACE_TYPES = [
  { value: 'Hard', label: 'Hard Court' },
  { value: 'Clay', label: 'Clay Court' },
  { value: 'Red Clay', label: 'Red Clay Court' },
  { value: 'Indoor', label: 'Indoor Court' },
] as const;

export default function LocationForm({
  initialData = {},
  onSubmit,
  onCancel,
  loading = false,
  isEdit = false,
  locations,
  initialAdjacentIds = [],
  currentLocationId
}: LocationFormProps) {
  // Memoize initial form data to prevent unnecessary updates
  const initialFormData = useMemo(() => ({
    name: initialData.name || '',
    surfaceType: initialData.surfaceType || '' as any,
    adjacentLocationIds: [...initialAdjacentIds],
  }), [initialData.name, initialData.surfaceType, initialAdjacentIds.join(',')]);

  const [formData, setFormData] = useState<CreateLocationData>(() => initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});

  // Filter out current location from adjacency options (for edit mode)
  const availableLocations = useMemo(() => 
    locations.filter(location => location.id !== currentLocationId),
    [locations, currentLocationId]
  );

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Location name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Location name must be at least 2 characters';
    }

    // Surface type validation
    if (!formData.surfaceType) {
      newErrors.surfaceType = 'Surface type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleNameChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      name: value
    }));
    
    if (errors.name) {
      setErrors(prev => ({
        ...prev,
        name: undefined
      }));
    }
  };

  const handleSurfaceTypeChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      surfaceType: value as any
    }));
    
    if (errors.surfaceType) {
      setErrors(prev => ({
        ...prev,
        surfaceType: undefined
      }));
    }
  };

  const handleAdjacencyToggle = (locationId: string, isChecked: boolean) => {
    setFormData(prev => {
      const currentAdjacentIds = prev.adjacentLocationIds || [];
      
      if (isChecked) {
        return {
          ...prev,
          adjacentLocationIds: currentAdjacentIds.includes(locationId) 
            ? currentAdjacentIds 
            : [...currentAdjacentIds, locationId]
        };
      } else {
        return {
          ...prev,
          adjacentLocationIds: currentAdjacentIds.filter(id => id !== locationId)
        };
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Location Name */}
        <Input
          label="Location Name"
          type="text"
          value={formData.name}
          onChange={(e) => handleNameChange(e.target.value)}
          error={errors.name}
          placeholder="Enter location name (e.g., Court 1, Field A)"
          required
        />

        {/* Surface Type */}
        <Select
          label="Surface Type"
          value={formData.surfaceType}
          onChange={(e) => handleSurfaceTypeChange(e.target.value)}
          error={errors.surfaceType}
          required
        >
          <option value="">Select surface type</option>
          {SURFACE_TYPES.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </Select>

        {/* Adjacent Locations */}
        <div className="space-y-3">
          <Typography variant="small" weight="medium">
            Adjacent Locations (optional)
          </Typography>
          <Typography variant="subtle" className="text-xs">
            Select locations that are physically adjacent to this one
          </Typography>
          
          {availableLocations.length === 0 ? (
            <Typography variant="small" className="text-neutral-500">
              {isEdit 
                ? "No other locations available for adjacency."
                : "No locations available. Add more locations to set up adjacencies."
              }
            </Typography>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto border border-neutral-200 rounded-md p-3">
              {availableLocations.map((location) => (
                <Checkbox
                  key={location.id}
                  checked={formData.adjacentLocationIds?.includes(location.id) || false}
                  onChange={(checked) => handleAdjacencyToggle(location.id, checked)}
                  label={
                    <div>
                      <Typography variant="small" weight="medium">
                        {location.name}
                      </Typography>
                      <Typography variant="subtle" className="text-xs">
                        {SURFACE_TYPES.find(t => t.value === location.surfaceType)?.label}
                      </Typography>
                    </div>
                  }
                />
              ))}
            </div>
          )}
          
          {formData.adjacentLocationIds && formData.adjacentLocationIds.length > 0 && (
            <Typography variant="small" className="text-neutral-600">
              {formData.adjacentLocationIds.length} adjacent location{formData.adjacentLocationIds.length === 1 ? '' : 's'} selected
            </Typography>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={loading}
        >
          {loading ? 'Saving...' : (isEdit ? 'Update Location' : 'Create Location')}
        </Button>
      </div>
    </form>
  );
} 