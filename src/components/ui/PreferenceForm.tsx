import { useState, useEffect } from 'react';
import Button from './Button';
import Select from './Select';
import Typography from './Typography';
import { CreateGroupPreferenceData, Group, Week, Location } from '../../types';

interface PreferenceFormProps {
  initialData?: Partial<CreateGroupPreferenceData & { id: string }>;
  onSubmit: (data: CreateGroupPreferenceData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  isEdit?: boolean;
  groups?: Group[];
  weeks?: Week[];
  locations?: Location[];
}

interface FormErrors {
  groupId?: string;
  weekId?: string;
  preferenceType?: string;
  locationIds?: string;
  surfaceType?: string;
}

export default function PreferenceForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  isEdit = false,
  groups = [],
  weeks = [],
  locations = []
}: PreferenceFormProps) {
  const [formData, setFormData] = useState<CreateGroupPreferenceData>({
    groupId: initialData?.groupId || '',
    weekId: initialData?.weekId || '',
    preferenceType: initialData?.preferenceType || 'location',
    locationIds: initialData?.locationIds || [],
    surfaceType: initialData?.surfaceType || undefined
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Update form data when initial data changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      setFormData({
        groupId: initialData.groupId || '',
        weekId: initialData.weekId || '',
        preferenceType: initialData.preferenceType || 'location',
        locationIds: initialData.locationIds || [],
        surfaceType: initialData.surfaceType || undefined
      });
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required field validation
    if (!formData.groupId) {
      newErrors.groupId = 'Group is required';
    }

    if (!formData.weekId) {
      newErrors.weekId = 'Week is required';
    }

    if (!formData.preferenceType) {
      newErrors.preferenceType = 'Preference type is required';
    }

    // Validate based on preference type
    if (formData.preferenceType === 'location' && (!formData.locationIds || formData.locationIds.length === 0)) {
      newErrors.locationIds = 'At least one location is required when preference type is location';
    }

    if (formData.preferenceType === 'surface' && !formData.surfaceType) {
      newErrors.surfaceType = 'Surface type is required when preference type is surface';
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
      // Clean up data based on preference type
      const submitData: CreateGroupPreferenceData = {
        groupId: formData.groupId,
        weekId: formData.weekId,
        preferenceType: formData.preferenceType,
        locationIds: formData.preferenceType === 'location' ? formData.locationIds : undefined,
        surfaceType: formData.preferenceType === 'surface' ? formData.surfaceType : undefined
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleInputChange = (field: keyof CreateGroupPreferenceData, value: any) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };

      // Clear related fields when preference type changes
      if (field === 'preferenceType') {
        if (value === 'location') {
          newData.surfaceType = undefined;
        } else if (value === 'surface') {
          newData.locationIds = [];
        }
      }

      return newData;
    });
    
    // Clear error when user makes changes
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleLocationToggle = (locationId: string) => {
    setFormData(prev => {
      const currentLocations = prev.locationIds || [];
      const isSelected = currentLocations.includes(locationId);
      
      const newLocationIds = isSelected
        ? currentLocations.filter(id => id !== locationId)
        : [...currentLocations, locationId];
      
      return {
        ...prev,
        locationIds: newLocationIds
      };
    });

    // Clear error when user makes changes
    if (errors.locationIds) {
      setErrors(prev => ({
        ...prev,
        locationIds: ''
      }));
    }
  };

  // Generate group options
  const groupOptions = groups.map(group => ({
    value: group.id,
    label: `${group.name} (${group.size} players)`
  }));

  // Generate week options
  const weekOptions = weeks.map(week => ({
    value: week.id,
    label: `${week.name} (${new Date(week.startDate).toLocaleDateString()} - ${new Date(week.endDate).toLocaleDateString()})`
  }));

  // Generate location options
  const locationOptions = locations.map(location => ({
    value: location.id,
    label: `${location.name} (${location.surfaceType})`
  }));

  // Surface type options
  const surfaceOptions = [
    { value: 'Hard', label: 'Hard Court' },
    { value: 'Clay', label: 'Clay Court' },
    { value: 'Red Clay', label: 'Red Clay Court' },
    { value: 'Indoor', label: 'Indoor Court' }
  ];

  // Preference type options
  const preferenceTypeOptions = [
    { value: 'location', label: 'Specific Location' },
    { value: 'surface', label: 'Surface Type' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Select
            label="Group"
            value={formData.groupId}
            onChange={(e) => handleInputChange('groupId', e.target.value)}
            error={errors.groupId}
            disabled={loading}
          >
            <option value="">Select a group</option>
            {groupOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Select
            label="Week"
            value={formData.weekId}
            onChange={(e) => handleInputChange('weekId', e.target.value)}
            error={errors.weekId}
            disabled={loading}
          >
            <option value="">Select a week</option>
            {weekOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <Select
          label="Preference Type"
          value={formData.preferenceType}
          onChange={(e) => handleInputChange('preferenceType', e.target.value)}
          error={errors.preferenceType}
          disabled={loading}
        >
          {preferenceTypeOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      {/* Location Selection */}
      {formData.preferenceType === 'location' && (
        <div>
          <Typography variant="small" weight="medium" className="block mb-2">
            Preferred Locations *
          </Typography>
          {errors.locationIds && (
            <Typography variant="small" className="text-red-600 mb-2">
              {errors.locationIds}
            </Typography>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {locations.map(location => (
              <label
                key={location.id}
                className="flex items-center space-x-2 p-3 border rounded-md cursor-pointer hover:bg-neutral-50"
              >
                <input
                  type="checkbox"
                  checked={formData.locationIds?.includes(location.id) || false}
                  onChange={() => handleLocationToggle(location.id)}
                  className="rounded"
                  disabled={loading}
                />
                <div>
                  <Typography variant="small" weight="medium">
                    {location.name}
                  </Typography>
                  <Typography variant="small" className="text-neutral-500">
                    {location.surfaceType} Court
                  </Typography>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Surface Type Selection */}
      {formData.preferenceType === 'surface' && (
        <div>
          <Select
            label="Preferred Surface Type"
            value={formData.surfaceType || ''}
            onChange={(e) => handleInputChange('surfaceType', e.target.value)}
            error={errors.surfaceType}
            disabled={loading}
          >
            <option value="">Select a surface type</option>
            {surfaceOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4">
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
          {loading ? 'Saving...' : (isEdit ? 'Update' : 'Add')} Preference
        </Button>
      </div>
    </form>
  );
} 