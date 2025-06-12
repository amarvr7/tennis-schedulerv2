import { useState, useEffect } from 'react';
import Button from './Button';
import Select from './Select';
import Typography from './Typography';
import { CreateCoachPreferenceData, Coach, Week, Location } from '../../types';

interface PreferenceFormProps {
  initialData?: Partial<CreateCoachPreferenceData & { id: string }>;
  onSubmit: (data: CreateCoachPreferenceData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  isEdit?: boolean;
  coaches?: Coach[];
  weeks?: Week[];
  locations?: Location[];
}

interface FormErrors {
  coachId?: string;
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
  coaches = [],
  weeks = [],
  locations = []
}: PreferenceFormProps) {
  const [formData, setFormData] = useState<CreateCoachPreferenceData>({
    coachId: initialData?.coachId || '',
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
        coachId: initialData.coachId || '',
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
    if (!formData.coachId) {
      newErrors.coachId = 'Coach is required';
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
      const submitData: CreateCoachPreferenceData = {
        coachId: formData.coachId,
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

  const handleInputChange = (field: keyof CreateCoachPreferenceData, value: any) => {
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
    if (errors[field]) {
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

  // Generate coach options
  const coachOptions = coaches.map(coach => ({
    value: coach.id,
    label: `${coach.name} (${coach.role === 'head' ? 'Head Coach' : 'Assistant Coach'})`
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
            label="Coach"
            value={formData.coachId}
            onChange={(e) => handleInputChange('coachId', e.target.value)}
            error={errors.coachId}
            required
          >
            <option value="">Select a coach</option>
            {coachOptions.map(option => (
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
            required
          >
            <option value="">Select a week</option>
            {weekOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="md:col-span-2">
          <Select
            label="Preference Type"
            value={formData.preferenceType}
            onChange={(e) => handleInputChange('preferenceType', e.target.value)}
            error={errors.preferenceType}
            required
          >
            {preferenceTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        {formData.preferenceType === 'location' && (
          <div className="md:col-span-2">
            <div className="space-y-2">
              <Typography variant="small" weight="medium" className="text-neutral-700">
                Preferred Locations *
              </Typography>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 border border-neutral-200 rounded-lg p-4">
                {locationOptions.map(option => (
                  <label key={option.value} className="flex items-center space-x-2 cursor-pointer hover:bg-neutral-50 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={formData.locationIds?.includes(option.value) || false}
                      onChange={() => handleLocationToggle(option.value)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                    />
                    <Typography variant="small" className="text-neutral-700">
                      {option.label}
                    </Typography>
                  </label>
                ))}
              </div>
              {errors.locationIds && (
                <Typography variant="small" className="text-error-600">
                  {errors.locationIds}
                </Typography>
              )}
            </div>
          </div>
        )}

        {formData.preferenceType === 'surface' && (
          <div className="md:col-span-2">
            <Select
              label="Preferred Surface Type"
              value={formData.surfaceType || ''}
              onChange={(e) => handleInputChange('surfaceType', e.target.value)}
              error={errors.surfaceType}
              required
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
      </div>

      <div className="flex justify-end space-x-3">
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
          {loading ? 'Saving...' : (isEdit ? 'Update Preference' : 'Add Preference')}
        </Button>
      </div>
    </form>
  );
} 